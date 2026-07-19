'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ShoppingCart,
  DollarSign,
  Briefcase,
  CheckCircle,
  FileDown,
  Info
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { inventoryService, authService, orderService, notificationService } from '@/services';
import { GymProduct } from '@/mock/inventory';
import { OrderRecord } from '@/services/db';

export default function SupplementPurchasePage() {
  const { showToast } = useToast();

  // Session state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Database products & orders
  const [products, setProducts] = useState<GymProduct[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Client Shop state
  const [cart, setCart] = useState<{ product: GymProduct; quantity: number }[]>([]);
  const [shopTab, setShopTab] = useState<'browse' | 'orders'>('browse');
  const [selectedShopPrd, setSelectedShopPrd] = useState<GymProduct | null>(null);
  const [isViewingCart, setIsViewingCart] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Invoice state after successful purchase
  const [activeReceipt, setActiveReceipt] = useState<OrderRecord | null>(null);

  const [checkoutForm, setCheckoutForm] = useState({
    address: '100 Fitness St, San Francisco, CA',
    paymentMode: 'gateway'
  });

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prds = await inventoryService.getProducts();
      setProducts(prds);
      
      const ords = await orderService.getAll();
      setOrders(ords);
    } catch {
      showToast('Error loading store data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cur = authService.getCurrentUser();
    setCurrentUser(cur);
    loadData();
  }, []);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.clientId === currentUser.entityId);
  }, [orders, currentUser]);

  // Cart operations
  const handleAddToCart = (product: GymProduct) => {
    if (product.currentStock <= 0) {
      showToast('Product is currently out of stock!', 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          showToast('Cannot add more than available stock limit.', 'error');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast('Added to cart.', 'success');
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const item = cart.find(i => i.product.id === productId);
    if (item) {
      if (newQty > item.product.currentStock) {
        showToast(`Cannot add more than ${item.product.currentStock} units in stock.`, 'error');
        return;
      }
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.product.sellingPrice * item.quantity), 0);
  }, [cart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsLoading(true);
    try {
      // 1. Create order record
      const newOrder = await orderService.create({
        clientId: currentUser?.entityId || 'CL-001',
        clientName: currentUser?.email || 'Client Member',
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          quantity: item.quantity,
          price: item.product.sellingPrice
        })),
        totalAmount: cartTotal,
        paymentMethod: checkoutForm.paymentMode
      });

      // 2. Deplete inventory stocks
      const updatedPrds = products.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          const nextStock = Math.max(0, p.currentStock - cartItem.quantity);
          
          // Trigger low stock notifications if thresholds breached
          if (nextStock <= p.minStock) {
            notificationService.create({
              title: `Low stock alert: ${p.name}`,
              message: `${p.name} stock level is currently at ${nextStock} units. Restock advised.`,
              type: 'warning',
              targetRole: 'manager'
            });
          }
          return { ...p, currentStock: nextStock };
        }
        return p;
      });

      await inventoryService.saveProducts(updatedPrds);
      setProducts(updatedPrds);

      // Trigger order alert notification for manager
      await notificationService.create({
        title: 'New Store Order Received',
        message: `Order ${newOrder.id} for $${newOrder.totalAmount} was checked out by client.`,
        type: 'success',
        targetRole: 'manager'
      });

      showToast('Checkout successful! Invoice generated.', 'success');
      setCart([]);
      setIsCheckoutOpen(false);
      setIsViewingCart(false);
      
      // Load updated collections
      loadData();
      
      // Set active receipt to render the invoice modal
      setActiveReceipt(newOrder);
    } catch {
      showToast('Checkout failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="Supplement & Product Purchase"
      description="Browse premium nutrition powders, energy bars, and official gym gear accessories."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsViewingCart(true)}
            className="text-xs py-1.5 px-4! flex items-center gap-1.5 border-slate-800 text-slate-300 hover:text-white"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span>Cart ({cart.length})</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2 text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          <button
            onClick={() => setShopTab('browse')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
              shopTab === 'browse' ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
            }`}
          >
            <Package className="h-4 w-4" /> Browse Catalog
          </button>
          <button
            onClick={() => setShopTab('orders')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
              shopTab === 'orders' ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
            }`}
          >
            <Clock className="h-4 w-4" /> Order History
          </button>
        </div>

        {/* Tab 1: Browse Shop */}
        {shopTab === 'browse' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  className="pl-9 text-xs"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'supplements', label: 'Nutrition Supplements' },
                  { value: 'merchandise', label: 'Gear & Apparel' },
                  { value: 'cafe', label: 'Cafe Beverages' }
                ]}
              />
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <Card key={p.id} className="border-slate-900 flex flex-col justify-between relative group hover:border-blue-500/20">
                  <CardContent className="space-y-4 pt-6">
                    <div className="h-32 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-center text-slate-600 overflow-hidden relative">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500">[ {p.category} ]</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</h4>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">${p.sellingPrice}</span>
                      </div>
                      <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">{p.brand} • {p.category.replace('_', ' ')}</p>
                      
                      <div className="flex justify-between items-center text-[10px] pt-1.5 font-semibold">
                        <span className="text-slate-500">Stock:</span>
                        <span className={p.currentStock <= 0 ? 'text-rose-500 font-bold' : p.currentStock <= p.minStock ? 'text-yellow-500' : 'text-slate-400'}>
                          {p.currentStock <= 0 ? 'Out of Stock' : `${p.currentStock} remaining`}
                        </span>
                      </div>

                      {p.expiryDate && (
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                          <span>Expiry Date:</span>
                          <span className="font-mono">{p.expiryDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedShopPrd(p)}
                        className="flex-1 text-[10px] py-1 border-slate-800 text-slate-400 hover:text-white"
                      >
                        Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={p.currentStock <= 0}
                        onClick={() => handleAddToCart(p)}
                        className="flex-1 text-[10px] py-1"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs font-semibold">
                  No products available.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Order History */}
        {shopTab === 'orders' && (
          <div className="space-y-4">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Order Date</th>
                    <th className="p-3">Items / Products</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {myOrders.map(o => (
                    <tr key={o.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-slate-500">{o.id}</td>
                      <td className="p-3 font-mono text-slate-500">{o.createdDate}</td>
                      <td className="p-3">
                        <div className="space-y-0.5 font-bold text-slate-200">
                          {o.items.map((item, idx) => (
                            <div key={idx}>
                              {item.name} <span className="text-slate-500 font-semibold">({item.quantity}x)</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">${o.totalAmount}</td>
                      <td className="p-3">
                        <Badge variant={o.status === 'completed' || o.status === 'pending' ? 'emerald' : 'rose'}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveReceipt(o)}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {myOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer Dialog */}
      <Dialog isOpen={isViewingCart} onClose={() => setIsViewingCart(false)} title="My Shopping Cart">
        <div className="space-y-4 pt-2 text-left">
          <div className="divide-y divide-slate-900/60 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-slate-200">{item.product.name}</h5>
                  <span className="text-[9px] text-slate-500 font-semibold">${item.product.sellingPrice} each</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                      className="h-6 w-6 border border-slate-800 rounded bg-slate-950 flex items-center justify-center text-slate-400 hover:text-white font-mono"
                    >
                      -
                    </button>
                    <span className="font-mono text-slate-200 w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                      className="h-6 w-6 border border-slate-800 rounded bg-slate-950 flex items-center justify-center text-slate-400 hover:text-white font-mono"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="p-1 rounded text-rose-500 hover:bg-slate-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-center text-slate-500 py-6 font-semibold">Your cart is empty.</p>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-900 pt-3 space-y-3 font-semibold text-xs">
              <div className="flex justify-between text-slate-200">
                <span>Cart Total:</span>
                <span className="font-mono text-emerald-400">${cartTotal}</span>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" size="sm" onClick={() => setIsViewingCart(false)} className="text-xs">
                  Continue shopping
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsCheckoutOpen(true)} className="text-xs px-4!">
                  Proceed to checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Product Details Modal */}
      {selectedShopPrd && (
        <Dialog isOpen={!!selectedShopPrd} onClose={() => setSelectedShopPrd(null)} title={selectedShopPrd.name} size="md">
          <div className="space-y-4 pt-2 text-left max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex gap-4 items-start">
              <div className="h-28 w-28 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-center text-slate-600 shrink-0">
                <Package className="h-8 w-8 text-slate-500" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block">{selectedShopPrd.brand}</span>
                <h4 className="text-sm font-bold text-slate-200 leading-tight">{selectedShopPrd.name}</h4>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Price:</span>
                  <span className="font-mono text-emerald-400 font-bold">${selectedShopPrd.sellingPrice}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Availability:</span>
                  <span className={selectedShopPrd.currentStock <= 0 ? 'text-rose-500 font-bold' : 'text-slate-300'}>
                    {selectedShopPrd.currentStock <= 0 ? 'Out of Stock' : `${selectedShopPrd.currentStock} in stock`}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-900 pt-3 text-xs">
              <div>
                <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Product Overview</h5>
                <p className="text-slate-400 leading-relaxed font-semibold">
                  {selectedShopPrd.description || 'Premium physical conditioning asset sourced from authorized manufacturers.'}
                </p>
              </div>

              {selectedShopPrd.ingredients && (
                <div>
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Ingredients</h5>
                  <p className="text-slate-400 leading-relaxed font-mono text-[10.5px]">
                    {selectedShopPrd.ingredients}
                  </p>
                </div>
              )}

              {selectedShopPrd.nutritionFacts && (
                <div>
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Nutrition Supplement Facts</h5>
                  <p className="text-slate-400 leading-relaxed font-semibold p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                    {selectedShopPrd.nutritionFacts}
                  </p>
                </div>
              )}

              {selectedShopPrd.directions && (
                <div>
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Directions & Usage</h5>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    {selectedShopPrd.directions}
                  </p>
                </div>
              )}

              {selectedShopPrd.warnings && (
                <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg text-[10.5px]">
                  <h5 className="font-bold text-rose-400 uppercase tracking-wider text-[9px] mb-0.5">Warnings & Allergen Statements</h5>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    {selectedShopPrd.warnings}
                  </p>
                </div>
              )}
            </div>

            {/* Verified Member Reviews */}
            <div className="border-t border-slate-900 pt-3 space-y-2 text-xs">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px]">Verified Member Reviews</h5>
              <div className="space-y-2">
                {[
                  { name: 'Gowtham Raj', rating: 5, comment: 'Exceptional blend, mixes perfectly without clumping. High protein yield!', date: '3 days ago' },
                  { name: 'Sarah Jenkins', rating: 4, comment: 'Great taste, chocolate is rich. Helps a lot with recovery cycles.', date: '1 week ago' }
                ].map((rev, i) => (
                  <div key={i} className="p-2 bg-slate-950/30 border border-slate-900/60 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-300">{rev.name}</span>
                      <span className="text-slate-500">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400 text-[10px]">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="text-slate-400 text-[10.5px] font-semibold">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setSelectedShopPrd(null)} className="text-xs">
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleAddToCart(selectedShopPrd);
                  setSelectedShopPrd(null);
                }}
                disabled={selectedShopPrd.currentStock <= 0}
                className="text-xs px-4!"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Checkout Form Modal */}
      <Dialog isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Shop Checkout Process">
        <form onSubmit={handleCheckout} className="space-y-4 pt-2 text-left">
          <Input
            label="Shipping Address"
            required
            value={checkoutForm.address}
            onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
          />
          
          <Select
            label="Select Payment Method"
            options={[
              { value: 'gateway', label: 'Credit Card / Online Gateway' },
              { value: 'cash', label: 'Pay Cash at Reception desk' }
            ]}
            value={checkoutForm.paymentMode}
            onChange={e => setCheckoutForm({ ...checkoutForm, paymentMode: e.target.value })}
          />

          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-xs font-semibold space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Cart Subtotal:</span>
              <span className="font-mono text-slate-300">${cartTotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST (18% included):</span>
              <span className="font-mono text-slate-300">${(cartTotal * 0.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-200 border-t border-slate-900 pt-1.5 font-bold">
              <span>Total Payable:</span>
              <span className="font-mono text-emerald-400">${cartTotal}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCheckoutOpen(false)} className="text-xs">
              Back to cart
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Complete Purchase
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Invoice Receipt Modal */}
      {activeReceipt && (
        <Dialog isOpen={!!activeReceipt} onClose={() => setActiveReceipt(null)} title="Purchase Invoice Receipt" size="md">
          <div className="space-y-6 pt-2 text-left">
            <div className="border-b border-slate-900 pb-4 space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">THE GYM FITNESS CLUB</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">100 Fitness Club Blvd, SF, CA</p>
                </div>
                <div className="text-right">
                  <Badge variant="emerald">PAID</Badge>
                  <p className="text-[9.5px] font-mono text-slate-500 font-semibold mt-1">Invoice: {activeReceipt.id}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Bill To:</p>
                <p className="text-slate-200 font-bold mt-0.5">{activeReceipt.clientName}</p>
                <p className="text-[10.5px] text-slate-500">{checkoutForm.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Invoice Date:</p>
                <p className="text-slate-300 font-mono mt-0.5">{activeReceipt.createdDate}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500 mt-2">Payment Method:</p>
                <p className="text-slate-300 mt-0.5 uppercase">{activeReceipt.paymentMethod}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-900 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 font-bold uppercase tracking-wider text-[8.5px] border-b border-slate-900 text-slate-400">
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {activeReceipt.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold">{item.name}</td>
                      <td className="p-2.5 text-center font-mono font-semibold">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">${item.price}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-100">${item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math Breakdown */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-semibold space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (excluding GST):</span>
                <span className="font-mono text-slate-300">${(activeReceipt.totalAmount * 0.82).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% included):</span>
                <span className="font-mono text-slate-300">${(activeReceipt.totalAmount * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-200 border-t border-slate-900 pt-2 font-bold text-sm">
                <span>Invoice Total:</span>
                <span className="font-mono text-emerald-400">${activeReceipt.totalAmount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => {
                // Trigger mockup PDF download toast
                showToast('Downloading invoice PDF...', 'info');
              }} className="text-xs flex items-center gap-1">
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveReceipt(null)} className="text-xs">
                Done
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </PageLayout>
  );
}

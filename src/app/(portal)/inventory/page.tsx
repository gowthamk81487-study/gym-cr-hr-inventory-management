'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreVertical,
  Activity,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Copy,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Info,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  ShoppingCart,
  Heart,
  Tag,
  CreditCard
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import { inventoryService, authService, orderService, notificationService } from '@/services';
import { GymProduct, GymEquipment, GymSupplier, GymPurchaseOrder } from '@/mock/inventory';
import { OrderRecord } from '@/services/db';

export default function InventoryPage() {
  const { showToast } = useToast();

  // Session state
  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Local Admin State
  const [products, setProducts] = useState<GymProduct[]>([]);
  const [equipmentList, setEquipmentList] = useState<GymEquipment[]>([]);
  const [suppliers, setSuppliers] = useState<GymSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<GymPurchaseOrder[]>([]);
  
  // Client Shop State
  const [cart, setCart] = useState<{ product: GymProduct; quantity: number }[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [shopTab, setShopTab] = useState<'browse' | 'orders'>('browse');
  const [selectedShopPrd, setSelectedShopPrd] = useState<GymProduct | null>(null);
  const [isViewingCart, setIsViewingCart] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    address: '100 Fitness St, San Francisco, CA',
    paymentMode: 'gateway'
  });

  // Tab Navigation for Admin
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'equipment' | 'orders' | 'alerts'>('dashboard');

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Records
  const [selectedProduct, setSelectedProduct] = useState<GymProduct | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<GymEquipment | null>(null);

  // Dialog triggers
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GymProduct | null>(null);
  const [isAddingPO, setIsAddingPO] = useState(false);
  const [isServicing, setIsServicing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'supplements' as 'supplements' | 'merchandise' | 'cafe' | 'locker_room',
    brand: '',
    supplierName: 'NutriFit Wholesale Ltd',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '30',
    minStock: '10',
    maxStock: '100',
    location: 'Aisle A',
    description: '',
    ingredients: '',
    nutritionFacts: '',
    directions: '',
    warnings: ''
  });

  const [poForm, setPoForm] = useState({
    supplierName: 'NutriFit Wholesale Ltd',
    itemsSummary: 'Whey Protein Isolate, preworkouts',
    quantityOrdered: '50',
    purchaseCost: '500',
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [serviceForm, setServiceForm] = useState({
    notes: 'Belt alignment check. Clean motor compartment.'
  });

  const loadData = async () => {
    try {
      const cur = authService.getCurrentUser();
      setCurrentUser(cur);
      if (cur) {
        setRole(cur.role);
        if (cur.role === 'client') {
          if (typeof window !== 'undefined') {
            window.location.replace('/purchase');
          }
          return;
        }
      }
      const prds = await inventoryService.getProducts();
      setProducts(prds);
      const eq = await inventoryService.getEquipment();
      setEquipmentList(eq);
      const sups = await inventoryService.getSuppliers();
      setSuppliers(sups);
      const pos = await inventoryService.getPOs();
      setPurchaseOrders(pos);

      // Load client orders
      const ords = await orderService.getAll();
      setOrders(ords);
    } catch {
      showToast('Error loading inventory.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Dashboard summary stats
  const dashboardStats = useMemo(() => {
    const totalPrds = products.length;
    const totalEqp = equipmentList.length;
    const lowStock = products.filter(p => p.currentStock <= p.minStock).length;
    const maintenanceDue = equipmentList.filter(e => e.condition === 'under_maintenance' || e.currentStatus === 'needs_inspection').length;
    const totalVal = products.reduce((acc, p) => acc + (p.purchasePrice * p.currentStock), 0);
    return { totalPrds, totalEqp, lowStock, maintenanceDue, totalVal };
  }, [products, equipmentList]);

  // 2. Filtered Sub-catalogs
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = filterCategory === 'all' || p.category === filterCategory;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, filterCategory, filterStatus]);

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = filterStatus === 'all' || e.currentStatus === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [equipmentList, searchQuery, filterStatus]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minStock);
  }, [products]);

  // Paginated slices
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPagesProducts = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedEquipment = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredEquipment.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredEquipment, currentPage]);

  const totalPagesEquipment = Math.ceil(filteredEquipment.length / itemsPerPage);

  const paginatedAlerts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return lowStockItems.slice(startIdx, startIdx + itemsPerPage);
  }, [lowStockItems, currentPage]);

  const totalPagesAlerts = Math.ceil(lowStockItems.length / itemsPerPage);

  // Form Handlers
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newPrd: GymProduct = {
        id: `PRD-${Date.now().toString().slice(-3)}`,
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        brand: productForm.brand,
        supplierName: productForm.supplierName,
        purchasePrice: parseFloat(productForm.purchasePrice || '10'),
        sellingPrice: parseFloat(productForm.sellingPrice || '18'),
        currentStock: parseInt(productForm.currentStock, 10),
        minStock: parseInt(productForm.minStock, 10),
        maxStock: parseInt(productForm.maxStock, 10),
        unit: 'units',
        gstPercent: 18,
        location: productForm.location,
        status: 'active',
        description: productForm.description,
        ingredients: productForm.ingredients,
        nutritionFacts: productForm.nutritionFacts,
        directions: productForm.directions,
        warnings: productForm.warnings
      };

      const updated = [newPrd, ...products];
      await inventoryService.saveProducts(updated);
      setProducts(updated);

      setIsAddingProduct(false);
      setProductForm({
        name: '',
        sku: '',
        category: 'supplements',
        brand: '',
        supplierName: 'NutriFit Wholesale Ltd',
        purchasePrice: '',
        sellingPrice: '',
        currentStock: '30',
        minStock: '10',
        maxStock: '100',
        location: 'Aisle A',
        description: '',
        ingredients: '',
        nutritionFacts: '',
        directions: '',
        warnings: ''
      });
      showToast('Product created successfully!', 'success');
      loadData();
    } catch {
      showToast('Error registering product.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !productForm.name || !productForm.sku) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updatedPrds = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productForm.name,
            sku: productForm.sku,
            category: productForm.category,
            brand: productForm.brand,
            supplierName: productForm.supplierName,
            purchasePrice: parseFloat(productForm.purchasePrice || '10'),
            sellingPrice: parseFloat(productForm.sellingPrice || '18'),
            currentStock: parseInt(productForm.currentStock, 10),
            minStock: parseInt(productForm.minStock, 10),
            maxStock: parseInt(productForm.maxStock, 10),
            location: productForm.location,
            description: productForm.description,
            ingredients: productForm.ingredients,
            nutritionFacts: productForm.nutritionFacts,
            directions: productForm.directions,
            warnings: productForm.warnings
          };
        }
        return p;
      });

      await inventoryService.saveProducts(updatedPrds);
      setProducts(updatedPrds);

      setIsEditingProduct(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: '',
        category: 'supplements',
        brand: '',
        supplierName: 'NutriFit Wholesale Ltd',
        purchasePrice: '',
        sellingPrice: '',
        currentStock: '30',
        minStock: '10',
        maxStock: '100',
        location: 'Aisle A',
        description: '',
        ingredients: '',
        nutritionFacts: '',
        directions: '',
        warnings: ''
      });
      showToast('Product updated successfully!', 'success');
      loadData();
    } catch {
      showToast('Failed to update product.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newPO: GymPurchaseOrder = {
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        supplierName: poForm.supplierName,
        itemsSummary: poForm.itemsSummary,
        quantityOrdered: parseInt(poForm.quantityOrdered, 10),
        purchaseCost: parseFloat(poForm.purchaseCost),
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: poForm.expectedDelivery,
        status: 'ordered'
      };

      const updated = [newPO, ...purchaseOrders];
      await inventoryService.savePOs(updated);
      setPurchaseOrders(updated);

      setIsAddingPO(false);
      showToast('Purchase Order sent to supplier!', 'success');
    } catch {
      showToast('PO failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setIsLoading(true);
    try {
      const updated = equipmentList.map(eq => {
        if (eq.id === selectedEquipment.id) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 90);
          return {
            ...eq,
            condition: 'excellent' as const,
            currentStatus: 'operational' as const,
            nextServiceDate: nextDate.toISOString().split('T')[0],
            notes: serviceForm.notes
          };
        }
        return eq;
      });

      await inventoryService.saveEquipment(updated);
      setEquipmentList(updated);
      setSelectedEquipment(null);
      setIsServicing(false);
      showToast('Equipment serviced successfully.', 'success');
    } catch {
      showToast('Error saving logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateProduct = async (prd: GymProduct) => {
    const copy: GymProduct = {
      ...prd,
      id: `PRD-copy-${Date.now()}`,
      name: `${prd.name} (Copy)`,
      sku: `${prd.sku}-COPY`
    };
    const updated = [copy, ...products];
    await inventoryService.saveProducts(updated);
    setProducts(updated);
    showToast('Product duplicated.', 'success');
  };

  // Client Store functions
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
      // 1. Create order
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

      // Trigger order alert notification
      await notificationService.create({
        title: 'New Store Order Received',
        message: `Order ${newOrder.id} for $${newOrder.totalAmount} was checked out.`,
        type: 'success',
        targetRole: 'manager'
      });

      showToast('Checkout successful! Mock payment logged.', 'success');
      setCart([]);
      setIsCheckoutOpen(false);
      setIsViewingCart(false);
      loadData();
    } catch {
      showToast('Checkout failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // CLIENT SHOP DIRECTORY
  if (role === 'client') {
    const myOrders = orders.filter(o => o.clientId === currentUser?.entityId);
    const shopProducts = products.filter(p => p.category === 'supplements' || p.category === 'merchandise');

    return (
      <PageLayout
        title="Supplements & Gear Store"
        description="Browse fitness powders, multi-vitamins, and club branded apparel items."
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
        <div className="space-y-6 py-2">
          {/* Shop Navigation */}
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

          {/* Browse Shop */}
          {shopTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shopProducts.slice(0, 12).map(p => (
                <Card key={p.id} className="border-slate-900 text-left flex flex-col justify-between relative group hover:border-blue-500/20">
                  <CardContent className="space-y-4 pt-6">
                    <div className="h-40 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-center text-slate-600 overflow-hidden relative">
                      <span className="font-mono text-[9px] uppercase tracking-wider">[ Product Image Mock ]</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] font-mono text-emerald-400">${p.sellingPrice}</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{p.brand} • {p.category}</span>
                    </div>

                    <div className="flex gap-2">
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
                        onClick={() => handleAddToCart(p)}
                        className="flex-1 text-[10px] py-1"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Client Order History */}
          {shopTab === 'orders' && (
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Purchased Items</th>
                    <th className="p-3">Order Date</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 font-mono">Total Amount</th>
                    <th className="p-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {myOrders.map(o => (
                    <tr key={o.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{o.id}</td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          {o.items.map((item, idx) => (
                            <p key={idx} className="text-xs font-bold text-slate-200">
                              {item.quantity}x {item.name} ({item.brand})
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{o.createdDate}</td>
                      <td className="p-3 uppercase text-[9px] text-blue-400">{o.paymentMethod}</td>
                      <td className="p-3 font-mono text-emerald-400">${o.totalAmount}</td>
                      <td className="p-3">
                        <Badge variant="emerald">{o.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {myOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No orders recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Details Shop Modal */}
        {selectedShopPrd && (
          <Dialog isOpen={!!selectedShopPrd} onClose={() => setSelectedShopPrd(null)} title={selectedShopPrd.name} size="md">
            <div className="space-y-4 pt-2 text-left max-h-[80vh] overflow-y-auto pr-1">
              
              {/* Product Gallery & Core Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-44 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-center text-slate-600 overflow-hidden relative">
                    <img
                      src={
                        selectedShopPrd.category === 'supplements'
                          ? 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=300&h=300'
                          : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=300&h=300'
                      }
                      alt={selectedShopPrd.name}
                      className="object-cover h-full w-full opacity-80"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="h-10 w-10 border border-slate-800 rounded bg-slate-950/40 opacity-70 cursor-pointer overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=80&h=80" className="object-cover h-full w-full" />
                    </div>
                    <div className="h-10 w-10 border border-slate-800 rounded bg-slate-950/40 opacity-70 cursor-pointer overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=80&h=80" className="object-cover h-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 font-semibold text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] block">Brand & Category</span>
                    <span className="text-slate-200 font-bold">{selectedShopPrd.brand} • <Badge variant="slate">{selectedShopPrd.category}</Badge></span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] block">SKU Code</span>
                    <span className="font-mono text-slate-400">{selectedShopPrd.sku}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] block">Stock Status</span>
                    <span>
                      {selectedShopPrd.currentStock > 0 ? (
                        <Badge variant="emerald">{selectedShopPrd.currentStock} Units Available</Badge>
                      ) : (
                        <Badge variant="rose">Out of Stock</Badge>
                      )}
                    </span>
                  </div>
                  <div className="border-t border-slate-900 pt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 uppercase text-[9px]">M.R.P.</span>
                      <span className="line-through text-slate-500 font-mono">${Math.round(selectedShopPrd.sellingPrice * 1.25)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 uppercase text-[9px]">Club Deal Price</span>
                      <span className="text-emerald-400 font-bold font-mono text-sm">${selectedShopPrd.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold">
                      <span>You Save:</span>
                      <span>20% Off Deal!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
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
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[9px] mb-1">Recommended Usage & Directions</h5>
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

              {/* Verified Product Reviews */}
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
                  Close details
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

        {/* View Cart Drawer Overlay */}
        <Dialog isOpen={isViewingCart} onClose={() => setIsViewingCart(false)} title="My Shopping Cart">
          <div className="space-y-4 pt-2 text-left">
            <div className="divide-y divide-slate-900/60 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-200">{item.product.name}</h5>
                    <span className="text-[9px] text-slate-500 font-semibold">{item.quantity}x @ ${item.product.sellingPrice} each</span>
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

        {/* Checkout Modal Dialog */}
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
                { value: 'gateway', label: 'Stripe Gateway' },
                { value: 'cash', label: 'Pay on Counter' },
                { value: 'upi', label: 'UPI / QR QR Remittance' }
              ]}
              value={checkoutForm.paymentMode}
              onChange={e => setCheckoutForm({ ...checkoutForm, paymentMode: e.target.value })}
            />

            <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Total Bill Amount:</span>
              <span className="font-mono text-emerald-400">${cartTotal}</span>
            </div>

            <div className="flex justify-end gap-3 pt-1 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsCheckoutOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-5! bg-emerald-600 hover:bg-emerald-500 border-emerald-500">
                Confirm order
              </Button>
            </div>
          </form>
        </Dialog>
      </PageLayout>
    );
  }

  // ADMIN / MANAGER INVENTORY PORTAL VIEW
  const triggerExport = () => {
    showToast('Exporting inventory spreadsheets...', 'info');
    setTimeout(() => {
      showToast('Spreadsheet download compiled.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title="Inventory & Asset Management"
      description="Track gym supplements, gear merchandise, equipment service lifecycles, and restock purchase orders."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export Assets
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingProduct(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Tab Navigation buttons */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'Inventory Dashboard', icon: Layers },
            { id: 'products', label: 'Product Catalog', icon: Package },
            { id: 'equipment', label: 'Equipment Registry', icon: Activity },
            { id: 'orders', label: 'Purchase Orders', icon: Briefcase },
            { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-slate-100'
                    : 'border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Products" value={dashboardStats.totalPrds} icon={Package} change="In stock catalog" />
              <StatCard title="Low Stock Items" value={dashboardStats.lowStock} icon={AlertTriangle} change="Reorder alerts" changeType={dashboardStats.lowStock > 0 ? 'decrease' : 'neutral'} />
              <StatCard title="Equipment Registry" value={dashboardStats.totalEqp} icon={Activity} change="Operational assets" />
              <StatCard title="Inventory Value" value={`$${Math.round(dashboardStats.totalVal).toLocaleString()}`} icon={DollarSign} change="Purchase cost aggregate" changeType="increase" />
            </div>

          </div>
        )}

        {/* Tab 2: Product Catalog */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <div className="relative w-full md:max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Select
                  options={[
                    { value: 'all', label: 'All Categories' },
                    { value: 'supplements', label: 'Supplements' },
                    { value: 'merchandise', label: 'Merchandise' },
                    { value: 'cafe', label: 'Cafe Drinks' },
                    { value: 'locker_room', label: 'Locker Room' }
                  ]}
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">Stock Level</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedProducts.map(prd => (
                    <tr key={prd.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{prd.name}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{prd.sku}</td>
                      <td className="p-3">
                        <Badge variant="slate">{prd.category}</Badge>
                      </td>
                      <td className="p-3 text-slate-400">{prd.brand}</td>
                      <td className="p-3">
                        <span className={prd.currentStock <= prd.minStock ? 'text-amber-400 font-bold' : ''}>
                          {prd.currentStock} {prd.unit} (Min: {prd.minStock})
                        </span>
                      </td>
                      <td className="p-3 text-right text-emerald-400 font-mono">${prd.sellingPrice}</td>
                      <td className="p-3 text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'Edit Product',
                              icon: Eye,
                              onClick: () => {
                                setEditingProduct(prd);
                                setProductForm({
                                  name: prd.name,
                                  sku: prd.sku,
                                  category: prd.category,
                                  brand: prd.brand,
                                  supplierName: prd.supplierName,
                                  purchasePrice: String(prd.purchasePrice),
                                  sellingPrice: String(prd.sellingPrice),
                                  currentStock: String(prd.currentStock),
                                  minStock: String(prd.minStock),
                                  maxStock: String(prd.maxStock || 100),
                                  location: prd.location,
                                  description: prd.description,
                                  ingredients: prd.ingredients || '',
                                  nutritionFacts: prd.nutritionFacts || '',
                                  directions: prd.directions || '',
                                  warnings: prd.warnings || ''
                                });
                                setIsEditingProduct(true);
                              }
                            },
                            {
                              label: 'Duplicate Product',
                              icon: Copy,
                              onClick: () => duplicateProduct(prd)
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesProducts} onPageChange={setCurrentPage} totalRecords={filteredProducts.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Tab 3: Equipment Registry */}
        {activeTab === 'equipment' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search equipment by name or serial..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Equipment Name</th>
                    <th className="p-3">Serial No</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Assigned Zone</th>
                    <th className="p-3">Next service Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedEquipment.map(eq => (
                    <tr key={eq.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{eq.name}</td>
                      <td className="p-3 font-mono text-[10.5px] text-slate-500">{eq.serialNumber}</td>
                      <td className="p-3">
                        <Badge variant={eq.condition === 'excellent' ? 'emerald' : eq.condition === 'good' ? 'blue' : 'warning'}>
                          {eq.condition}
                        </Badge>
                      </td>
                      <td className="p-3">{eq.assignedArea}</td>
                      <td className="p-3 font-mono text-slate-500">{eq.nextServiceDate}</td>
                      <td className="p-3">
                        <Badge variant={eq.currentStatus === 'operational' ? 'emerald' : 'rose'}>
                          {eq.currentStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'Service Machinery',
                              icon: Clock,
                              onClick: () => {
                                setSelectedEquipment(eq);
                                setIsServicing(true);
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesEquipment} onPageChange={setCurrentPage} totalRecords={filteredEquipment.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Tab 4: Purchase Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400">Restock procurement orders queue</p>
              <Button variant="primary" size="sm" onClick={() => setIsAddingPO(true)} className="text-xs">
                Draft Purchase Order
              </Button>
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Items Summary</th>
                    <th className="p-3">Expected Delivery</th>
                    <th className="p-3 text-right">Cost</th>
                    <th className="p-3 text-right">PO Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {purchaseOrders.slice(0, 8).map(po => (
                    <tr key={po.poNumber} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-[10.5px] font-bold">{po.poNumber}</td>
                      <td className="p-3">{po.supplierName}</td>
                      <td className="p-3 text-slate-400">{po.itemsSummary} (Qty: {po.quantityOrdered})</td>
                      <td className="p-3 font-mono text-slate-500">{po.expectedDelivery}</td>
                      <td className="p-3 text-right font-mono text-emerald-400">${po.purchaseCost}</td>
                      <td className="p-3 text-right">
                        <Badge variant={po.status === 'delivered' ? 'emerald' : po.status === 'ordered' ? 'blue' : 'slate'}>
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Low Stock Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Minimum Stock</th>
                    <th className="p-3">Restock Margin</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedAlerts.map(prd => (
                    <tr key={prd.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{prd.name}</td>
                      <td className="p-3 font-mono text-[10.5px] text-slate-500">{prd.sku}</td>
                      <td className="p-3 text-amber-400 font-bold">{prd.currentStock} units</td>
                      <td className="p-3 text-slate-500">{prd.minStock} units</td>
                      <td className="p-3 text-blue-400">Recommend Restock Qty: {prd.maxStock - prd.currentStock}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            showToast(`Restock draft purchase order generated for ${prd.brand}!`, 'success');
                          }}
                          className="text-[10px] py-1"
                        >
                          Generate PO
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Admin Add Product Modal */}
      <Dialog isOpen={isAddingProduct} onClose={() => setIsAddingProduct(false)} title="Add Product to Catalog">
        <form onSubmit={handleAddProductSubmit} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          <Input label="Product Name" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Whey Protein Isolate" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU Code" required value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} placeholder="WPI-STRAW-2KG" />
            <Select
              label="Product Category"
              options={[
                { value: 'supplements', label: 'Supplements' },
                { value: 'merchandise', label: 'Merchandise' },
                { value: 'cafe', label: 'Cafe Drinks' },
                { value: 'locker_room', label: 'Locker Room' }
              ]}
              value={productForm.category}
              onChange={e => setProductForm({ ...productForm, category: e.target.value as any })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Brand" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
            <Input label="Purchase Price ($)" type="number" value={productForm.purchasePrice} onChange={e => setProductForm({ ...productForm, purchasePrice: e.target.value })} />
            <Input label="Selling Price ($)" type="number" value={productForm.sellingPrice} onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Current Stock" type="number" value={productForm.currentStock} onChange={e => setProductForm({ ...productForm, currentStock: e.target.value })} />
            <Input label="Min Stock Alert" type="number" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: e.target.value })} />
            <Input label="Location" value={productForm.location} onChange={e => setProductForm({ ...productForm, location: e.target.value })} />
          </div>
          <Input label="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="High quality whey isolate" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ingredients" value={productForm.ingredients} onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })} placeholder="Whey protein, cocoa, lecithin" />
            <Input label="Nutrition Facts" value={productForm.nutritionFacts} onChange={e => setProductForm({ ...productForm, nutritionFacts: e.target.value })} placeholder="Protein: 25g, Carbs: 2g, Fat: 1g" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Directions" value={productForm.directions} onChange={e => setProductForm({ ...productForm, directions: e.target.value })} placeholder="Take 1 scoop with 250ml water" />
            <Input label="Warnings" value={productForm.warnings} onChange={e => setProductForm({ ...productForm, warnings: e.target.value })} placeholder="Not suitable for lactose intolerant" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingProduct(false)} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Add Product</Button>
          </div>
        </form>
      </Dialog>

      {/* Admin Edit Product Modal */}
      <Dialog isOpen={isEditingProduct} onClose={() => { setIsEditingProduct(false); setEditingProduct(null); }} title="Edit Product details">
        <form onSubmit={handleEditProductSubmit} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          <Input label="Product Name" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU Code" required value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
            <Select
              label="Product Category"
              options={[
                { value: 'supplements', label: 'Supplements' },
                { value: 'merchandise', label: 'Merchandise' },
                { value: 'cafe', label: 'Cafe Drinks' },
                { value: 'locker_room', label: 'Locker Room' }
              ]}
              value={productForm.category}
              onChange={e => setProductForm({ ...productForm, category: e.target.value as any })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Brand" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
            <Input label="Purchase Price ($)" type="number" value={productForm.purchasePrice} onChange={e => setProductForm({ ...productForm, purchasePrice: e.target.value })} />
            <Input label="Selling Price ($)" type="number" value={productForm.sellingPrice} onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Current Stock" type="number" value={productForm.currentStock} onChange={e => setProductForm({ ...productForm, currentStock: e.target.value })} />
            <Input label="Min Stock Alert" type="number" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: e.target.value })} />
            <Input label="Location" value={productForm.location} onChange={e => setProductForm({ ...productForm, location: e.target.value })} />
          </div>
          <Input label="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ingredients" value={productForm.ingredients} onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })} />
            <Input label="Nutrition Facts" value={productForm.nutritionFacts} onChange={e => setProductForm({ ...productForm, nutritionFacts: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Directions" value={productForm.directions} onChange={e => setProductForm({ ...productForm, directions: e.target.value })} />
            <Input label="Warnings" value={productForm.warnings} onChange={e => setProductForm({ ...productForm, warnings: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => { setIsEditingProduct(false); setEditingProduct(null); }} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Save Changes</Button>
          </div>
        </form>
      </Dialog>

      {/* Service Equipment Modal */}
      {selectedEquipment && (
        <Dialog isOpen={isServicing} onClose={() => setIsServicing(false)} title={`Service Asset: ${selectedEquipment.name}`}>
          <form onSubmit={handleServiceSubmit} className="space-y-4 pt-2">
            <Input label="Equipment Serial Number" disabled value={selectedEquipment.serialNumber} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service logs & notes</label>
              <textarea
                rows={3}
                required
                value={serviceForm.notes}
                onChange={e => setServiceForm({ ...serviceForm, notes: e.target.value })}
                className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsServicing(false)} className="text-xs">Cancel</Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Record Service</Button>
            </div>
          </form>
        </Dialog>
      )}
    </PageLayout>
  );
}

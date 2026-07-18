'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
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
  Briefcase
} from 'lucide-react';
import {
  mockProducts,
  mockEquipment,
  mockSuppliers,
  mockPurchaseOrders,
  GymProduct,
  GymEquipment,
  GymSupplier,
  GymPurchaseOrder
} from '@/mock/inventory';
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

export default function InventoryPage() {
  const { showToast } = useToast();

  // Local State
  const [products, setProducts] = useState<GymProduct[]>(mockProducts);
  const [equipmentList, setEquipmentList] = useState<GymEquipment[]>(mockEquipment);
  const [suppliers, setSuppliers] = useState<GymSupplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<GymPurchaseOrder[]>(mockPurchaseOrders);
  
  // Tab Navigation
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
  const [isAddingPO, setIsAddingPO] = useState(false);
  const [isServicing, setIsServicing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'supplements' as const,
    brand: '',
    supplierName: 'NutriFit Wholesale Ltd',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '30',
    minStock: '10',
    maxStock: '100',
    location: 'Aisle A',
    description: ''
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
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddingProduct(false);

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
        description: productForm.description
      };

      setProducts([newPrd, ...products]);
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
        description: ''
      });
      showToast('Product created successfully!', 'success');
    }, 1200);
  };

  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddingPO(false);

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

      setPurchaseOrders([newPO, ...purchaseOrders]);
      showToast('Purchase Order sent to supplier!', 'success');
    }, 1200);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsServicing(false);

      const updated = equipmentList.map(eq => {
        if (eq.id === selectedEquipment.id) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 90); // 90 days cycle
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

      setEquipmentList(updated);
      setSelectedEquipment(null);
      showToast('Equipment serviced and operational status restored.', 'success');
    }, 1200);
  };

  const duplicateProduct = (prd: GymProduct) => {
    const copy: GymProduct = {
      ...prd,
      id: `PRD-copy-${Date.now()}`,
      name: `${prd.name} (Copy)`,
      sku: `${prd.sku}-COPY`
    };
    setProducts([copy, ...products]);
    showToast('Product duplicated.', 'success');
  };

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
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Products" value={dashboardStats.totalPrds} icon={Package} change="In stock catalog" />
              <StatCard title="Low Stock Items" value={dashboardStats.lowStock} icon={AlertTriangle} change="Reorder alerts" changeType={dashboardStats.lowStock > 0 ? 'decrease' : 'neutral'} />
              <StatCard title="Equipment Registry" value={dashboardStats.totalEqp} icon={Activity} change="Operational assets" />
              <StatCard title="Inventory Value" value={`$${Math.round(dashboardStats.totalVal).toLocaleString()}`} icon={DollarSign} change="Purchase cost aggregate" changeType="increase" />
            </div>

            {/* AI Demand forecasting stubs banner */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Predictive Maintenance & Supply Forecasting</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                    AI analyzes equipment cycle wear to trigger maintenance alerts before breakdown. Auto-suggests restock POs based on monthly sales checkouts.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Restock predictions synced!', 'success')}
                className="text-[10px] py-1 border-slate-800 text-blue-400 hover:text-blue-300 font-bold shrink-0 cursor-pointer"
              >
                Forecast Restock
              </Button>
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
                              label: 'Duplicate Product',
                              icon: Copy,
                              onClick: () => duplicateProduct(prd)
                            },
                            {
                              label: 'Deplete Stock (-1)',
                              icon: Trash2,
                              danger: true,
                              onClick: () => {
                                const updated = products.map(p => {
                                  if (p.id === prd.id && p.currentStock > 0) {
                                    return { ...p, currentStock: p.currentStock - 1 };
                                  }
                                  return p;
                                });
                                setProducts(updated);
                                showToast('Stock quantity depleted.', 'info');
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
                  {lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        All supply thresholds are normal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPagesAlerts} onPageChange={setCurrentPage} totalRecords={lowStockItems.length} itemsPerPage={itemsPerPage} />
          </div>
        )}
      </div>

      {/* OVERLAY DIALOG MODALS */}

      {/* A. Create Product Modal */}
      <Dialog isOpen={isAddingProduct} onClose={() => setIsAddingProduct(false)} title="Add Product to Catalog">
        <form onSubmit={handleAddProductSubmit} className="space-y-4 pt-2">
          <Input
            label="Product Name"
            required
            value={productForm.name}
            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
            placeholder="Whey Protein Isolate (Strawberry)"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU Code"
              required
              value={productForm.sku}
              onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
              placeholder="WPI-STRAW-2KG"
            />
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

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingProduct(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Add Product
            </Button>
          </div>
        </form>
      </Dialog>

      {/* B. Create Purchase Order Modal */}
      <Dialog isOpen={isAddingPO} onClose={() => setIsAddingPO(false)} title="Draft Purchase Order">
        <form onSubmit={handlePOSubmit} className="space-y-4 pt-2">
          
          <Select
            label="Supplier Company"
            required
            options={suppliers.map(s => ({ value: s.company, label: s.company }))}
            value={poForm.supplierName}
            onChange={e => setPoForm({ ...poForm, supplierName: e.target.value })}
          />

          <Input
            label="Items Description Summary"
            required
            value={poForm.itemsSummary}
            onChange={e => setPoForm({ ...poForm, itemsSummary: e.target.value })}
            placeholder="Whey Isolate Protein, preworkouts"
          />

          <div className="grid grid-cols-3 gap-2">
            <Input label="Total Quantity" type="number" value={poForm.quantityOrdered} onChange={e => setPoForm({ ...poForm, quantityOrdered: e.target.value })} />
            <Input label="Estimated Cost ($)" type="number" value={poForm.purchaseCost} onChange={e => setPoForm({ ...poForm, purchaseCost: e.target.value })} />
            <Input label="Delivery Date" type="date" required value={poForm.expectedDelivery} onChange={e => setPoForm({ ...poForm, expectedDelivery: e.target.value })} className="scheme-dark" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingPO(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Send Order
            </Button>
          </div>
        </form>
      </Dialog>

      {/* C. Service Equipment Modal */}
      {selectedEquipment && (
        <Dialog isOpen={isServicing} onClose={() => setIsServicing(false)} title={`Service Asset: ${selectedEquipment.name}`}>
          <form onSubmit={handleServiceSubmit} className="space-y-4 pt-2">
            
            <Input
              label="Equipment Serial Number"
              disabled
              value={selectedEquipment.serialNumber}
            />

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
              <Button variant="outline" size="sm" onClick={() => setIsServicing(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Record Service
              </Button>
            </div>
          </form>
        </Dialog>
      )}

    </PageLayout>
  );
}

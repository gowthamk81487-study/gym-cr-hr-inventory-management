export interface GymProduct {
  id: string;
  name: string;
  sku: string;
  category: 'supplements' | 'merchandise' | 'cafe' | 'locker_room';
  brand: string;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: 'units' | 'kg' | 'lbs' | 'scoops' | 'bottles';
  gstPercent: number;
  location: string;
  expiryDate?: string;
  status: 'active' | 'archived';
  description: string;
}

export interface GymEquipment {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'free_weights' | 'recovery';
  purchaseDate: string;
  warrantyYears: number;
  condition: 'excellent' | 'good' | 'fair' | 'under_maintenance';
  assignedArea: string;
  maintenanceCycleDays: number;
  nextServiceDate: string;
  currentStatus: 'operational' | 'out_of_service' | 'needs_inspection';
  serialNumber: string;
  vendorName: string;
  notes?: string;
}

export interface GymSupplier {
  id: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface GymPurchaseOrder {
  poNumber: string;
  supplierName: string;
  itemsSummary: string;
  quantityOrdered: number;
  purchaseCost: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'ordered' | 'delivered' | 'cancelled';
}

// 1. Generate 200 Products
const detailedProducts: GymProduct[] = [
  {
    id: 'PRD-001',
    name: 'Whey Protein Isolate (Chocolate)',
    sku: 'WPI-CHOC-2KG',
    category: 'supplements',
    brand: 'Optimum Nutrition',
    supplierName: 'NutriFit Wholesale Ltd',
    purchasePrice: 45,
    sellingPrice: 75,
    currentStock: 12, // Low stock (min is 15)
    minStock: 15,
    maxStock: 50,
    unit: 'units',
    gstPercent: 18,
    location: 'Aisle 3, Shelf B',
    expiryDate: '2027-03-15',
    status: 'active',
    description: 'High-quality whey protein isolate for post-workout muscle repair.'
  },
  {
    id: 'PRD-002',
    name: 'Gym Branded Shaker Bottle',
    sku: 'SHK-BLK-700',
    category: 'merchandise',
    brand: 'Provolution Gear',
    supplierName: 'Siam Merchandise Partners',
    purchasePrice: 4,
    sellingPrice: 12,
    currentStock: 65,
    minStock: 20,
    maxStock: 150,
    unit: 'units',
    gstPercent: 18,
    location: 'Front Counter Display',
    status: 'active',
    description: 'BPA-free 700ml shaker bottle with wire mixing ball.'
  },
  {
    id: 'PRD-003',
    name: 'Pre-Workout Energy Shot (Berry)',
    sku: 'PRE-BER-60ML',
    category: 'cafe',
    brand: 'C4 Energy',
    supplierName: 'NutriFit Wholesale Ltd',
    purchasePrice: 1.5,
    sellingPrice: 3.99,
    currentStock: 3, // Critical low stock (min is 30)
    minStock: 30,
    maxStock: 200,
    unit: 'bottles',
    gstPercent: 18,
    location: 'Café Refrigerator B',
    expiryDate: '2026-11-20',
    status: 'active',
    description: 'Zero sugar energy shot for explosive workouts.'
  }
];

function generateProducts(): GymProduct[] {
  const list = [...detailedProducts];
  const brands = ['Optimum Nutrition', 'Muscletech', 'Provolution Brand', 'Vitals', 'MyProtein'];
  const suppliers = ['NutriFit Wholesale Ltd', 'Siam Merchandise Partners', 'Apex Sports Supply'];
  const categories: ('supplements' | 'merchandise' | 'cafe' | 'locker_room')[] = ['supplements', 'merchandise', 'cafe', 'locker_room'];

  for (let i = 4; i <= 200; i++) {
    const brand = brands[i % brands.length];
    const supp = suppliers[i % suppliers.length];
    const cat = categories[i % categories.length];
    
    list.push({
      id: `PRD-${String(i).padStart(3, '0')}`,
      name: `${brand} ${cat.charAt(0).toUpperCase() + cat.slice(1)} Item Option v${i}`,
      sku: `${cat.slice(0,3).toUpperCase()}-${brand.slice(0,3).toUpperCase()}-${i}00`,
      category: cat,
      brand: brand,
      supplierName: supp,
      purchasePrice: 10 + (i % 80),
      sellingPrice: 18 + (i % 120),
      currentStock: (i % 45) + 1,
      minStock: 10 + (i % 15),
      maxStock: 100 + (i % 100),
      unit: 'units',
      gstPercent: 18,
      location: `Section ${i % 5}, Row ${i % 3}`,
      status: 'active',
      description: 'Standard inventory product for club supply chain operations.'
    });
  }
  return list;
}

export const mockProducts = generateProducts();

// 2. Generate 100 Equipment Records
const detailedEquipment: GymEquipment[] = [
  {
    id: 'EQP-001',
    name: 'Commercial Treadmill T900',
    category: 'cardio',
    purchaseDate: '2025-01-15',
    warrantyYears: 3,
    condition: 'good',
    assignedArea: 'Cardio Row A',
    maintenanceCycleDays: 90,
    nextServiceDate: '2026-07-25', // Next week
    currentStatus: 'operational',
    serialNumber: 'TRD-900-9874',
    vendorName: 'Matrix Fitness Solutions',
    notes: 'Belt alignment adjusted during last cycle.'
  },
  {
    id: 'EQP-002',
    name: 'Olympic Flat Bench Press Station',
    category: 'strength',
    purchaseDate: '2025-02-10',
    warrantyYears: 5,
    condition: 'excellent',
    assignedArea: 'Free Weights zone',
    maintenanceCycleDays: 180,
    nextServiceDate: '2026-08-10',
    currentStatus: 'operational',
    serialNumber: 'STN-FBP-4521',
    vendorName: 'Rogue Athletic Corp',
    notes: 'Upholstery sanitization certified.'
  },
  {
    id: 'EQP-003',
    name: 'Concept2 Row Ergometer Model D',
    category: 'cardio',
    purchaseDate: '2025-03-01',
    warrantyYears: 2,
    condition: 'under_maintenance',
    assignedArea: 'Rowing Alcove',
    maintenanceCycleDays: 60,
    nextServiceDate: '2026-07-16', // Overdue
    currentStatus: 'out_of_service',
    serialNumber: 'ERG-ROW-1124',
    vendorName: 'Concept2 Australia',
    notes: 'Flywheel chain replacement required.'
  }
];

function generateEquipment(): GymEquipment[] {
  const list = [...detailedEquipment];
  const categories: ('cardio' | 'strength' | 'free_weights' | 'recovery')[] = ['cardio', 'strength', 'free_weights', 'recovery'];
  const vendors = ['Matrix Fitness Solutions', 'Rogue Athletic Corp', 'Concept2 Australia', 'Life Fitness Inc'];
  const conditions: ('excellent' | 'good' | 'fair' | 'under_maintenance')[] = ['excellent', 'good', 'fair', 'under_maintenance'];

  for (let i = 4; i <= 100; i++) {
    const cat = categories[i % categories.length];
    const ven = vendors[i % vendors.length];
    const cond = conditions[i % conditions.length];
    
    list.push({
      id: `EQP-${String(i).padStart(3, '0')}`,
      name: `${ven} ${cat.charAt(0).toUpperCase() + cat.slice(1)} Machine v${i}`,
      category: cat,
      purchaseDate: `2025-04-${String((i % 28) + 1).padStart(2, '0')}`,
      warrantyYears: 3,
      condition: cond,
      assignedArea: `Zone ${i % 4}`,
      maintenanceCycleDays: 90,
      nextServiceDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`,
      currentStatus: cond === 'under_maintenance' ? 'needs_inspection' : 'operational',
      serialNumber: `SER-${cat.slice(0,2).toUpperCase()}-${1000 + i}`,
      vendorName: ven,
      notes: 'Operational club asset.'
    });
  }
  return list;
}

export const mockEquipment = generateEquipment();

// 3. Generate 20 Suppliers
function generateSuppliers(): GymSupplier[] {
  const list: GymSupplier[] = [];
  const companies = ['NutriFit Wholesale Ltd', 'Siam Merchandise Partners', 'Apex Sports Supply', 'Technogym Solutions', 'Rogue Athletic Corp'];

  for (let i = 1; i <= 20; i++) {
    const comp = companies[i % companies.length];
    list.push({
      id: `SPL-${String(i).padStart(3, '0')}`,
      company: i <= 3 ? comp : `${comp} Division ${i}`,
      contactPerson: `Manager Name ${i}`,
      phone: `+1 (555) 019-${String(8000 + i)}`,
      email: `orders@${comp.toLowerCase().replace(/ /g, '')}.com`,
      gstNumber: `GST-IN-${29000 + i}A1Z1`,
      address: `Industrial Avenue ${i}, Sector 4`,
      status: 'active'
    });
  }
  return list;
}

export const mockSuppliers = generateSuppliers();

// 4. Generate 50 Purchase Orders
function generatePurchaseOrders(): GymPurchaseOrder[] {
  const list: GymPurchaseOrder[] = [];
  const suppliers = ['NutriFit Wholesale Ltd', 'Siam Merchandise Partners', 'Apex Sports Supply', 'Technogym Solutions'];
  const statuses: ('draft' | 'ordered' | 'delivered' | 'cancelled')[] = ['draft', 'ordered', 'delivered', 'cancelled'];

  for (let i = 1; i <= 50; i++) {
    const supp = suppliers[i % suppliers.length];
    const status = statuses[i % statuses.length];
    list.push({
      poNumber: `PO-${String(202600 + i)}`,
      supplierName: supp,
      itemsSummary: i % 2 === 0 ? 'Whey Isolate Protein, preworkouts' : 'Gym towels, branded shirts',
      quantityOrdered: 50 + (i % 5) * 10,
      purchaseCost: 200 + (i % 10) * 150,
      orderDate: `2026-07-${String((i % 15) + 1).padStart(2, '0')}`,
      expectedDelivery: `2026-08-${String((i % 15) + 1).padStart(2, '0')}`,
      status: status
    });
  }
  return list;
}

export const mockPurchaseOrders = generatePurchaseOrders();

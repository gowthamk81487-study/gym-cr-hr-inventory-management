/**
 * Gym HR, Membership & Client CRM System - Service Layer
 * Connects portal components to the persistent local database.
 */

import { db, EnquiryRecord, OrderRecord, UserRecord, NotificationRecord } from './db';
import {
  Client,
  Coach,
  Staff,
  Membership,
  InventoryItem,
  PaymentRecord,
  WorkoutPlan,
  DietPlan,
  SystemNotification,
  ReportSummary,
  CoachTransferHistory
} from '@/types';
import { GymProduct, GymEquipment, GymSupplier, GymPurchaseOrder } from '@/mock/inventory';

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export { authService } from './auth';

export const clientService = {
  async getAll(): Promise<Client[]> {
    await delay(100);
    return db.getCollection<Client>('gym_clients');
  },

  async getById(id: string): Promise<Client | undefined> {
    await delay(50);
    const list = db.getCollection<Client>('gym_clients');
    return list.find(c => c.id === id);
  },

  async create(client: Client): Promise<Client> {
    await delay(150);
    const list = db.getCollection<Client>('gym_clients');
    list.push(client);
    db.saveCollection('gym_clients', list);
    return client;
  },

  async update(client: Client): Promise<Client> {
    await delay(150);
    const list = db.getCollection<Client>('gym_clients');
    const idx = list.findIndex(c => c.id === client.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...client };
      db.saveCollection('gym_clients', list);
      return list[idx];
    }
    throw new Error('Client record not found.');
  },

  async delete(id: string): Promise<void> {
    await delay(100);
    const list = db.getCollection<Client>('gym_clients');
    const filtered = list.filter(c => c.id !== id);
    db.saveCollection('gym_clients', filtered);
  }
};

export const coachService = {
  async getAll(): Promise<Coach[]> {
    await delay(100);
    return db.getCollection<Coach>('gym_coaches');
  },

  async getById(id: string): Promise<Coach | undefined> {
    await delay(50);
    const list = db.getCollection<Coach>('gym_coaches');
    return list.find(c => c.id === id);
  },

  async create(coach: Coach): Promise<Coach> {
    await delay(150);
    const list = db.getCollection<Coach>('gym_coaches');
    list.push(coach);
    db.saveCollection('gym_coaches', list);
    return coach;
  },

  async update(coach: Coach): Promise<Coach> {
    await delay(150);
    const list = db.getCollection<Coach>('gym_coaches');
    const idx = list.findIndex(c => c.id === coach.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...coach };
      db.saveCollection('gym_coaches', list);
      return list[idx];
    }
    throw new Error('Coach not found.');
  },

  async delete(id: string): Promise<void> {
    await delay(100);
    const list = db.getCollection<Coach>('gym_coaches');
    const filtered = list.filter(c => c.id !== id);
    db.saveCollection('gym_coaches', filtered);
  }
};

export const staffService = {
  async getAll(): Promise<Staff[]> {
    await delay(100);
    return db.getCollection<Staff>('gym_staff');
  },

  async create(staff: Staff): Promise<Staff> {
    await delay(150);
    const list = db.getCollection<Staff>('gym_staff');
    list.push(staff);
    db.saveCollection('gym_staff', list);
    return staff;
  },

  async update(staff: Staff): Promise<Staff> {
    await delay(150);
    const list = db.getCollection<Staff>('gym_staff');
    const idx = list.findIndex(s => s.id === staff.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...staff };
      db.saveCollection('gym_staff', list);
      return list[idx];
    }
    throw new Error('Staff not found.');
  },

  async delete(id: string): Promise<void> {
    await delay(100);
    const list = db.getCollection<Staff>('gym_staff');
    const filtered = list.filter(s => s.id !== id);
    db.saveCollection('gym_staff', filtered);
  }
};

export const membershipService = {
  async getAll(): Promise<Membership[]> {
    await delay(50);
    return db.getCollection<Membership>('gym_memberships');
  },

  async create(membership: Membership): Promise<Membership> {
    await delay(150);
    const list = db.getCollection<Membership>('gym_memberships');
    list.push(membership);
    db.saveCollection('gym_memberships', list);
    return membership;
  },

  async update(membership: Membership): Promise<Membership> {
    await delay(150);
    const list = db.getCollection<Membership>('gym_memberships');
    const idx = list.findIndex(m => m.id === membership.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...membership };
      db.saveCollection('gym_memberships', list);
      return list[idx];
    }
    throw new Error('Membership plan not found.');
  }
};

// Extends inventory items to separate products, equipment, suppliers, purchase orders
export const inventoryService = {
  async getProducts(): Promise<GymProduct[]> {
    await delay(100);
    return db.getCollection<GymProduct>('gym_products');
  },

  async saveProducts(products: GymProduct[]): Promise<void> {
    db.saveCollection('gym_products', products);
  },

  async getEquipment(): Promise<GymEquipment[]> {
    await delay(100);
    return db.getCollection<GymEquipment>('gym_equipment');
  },

  async saveEquipment(equipment: GymEquipment[]): Promise<void> {
    db.saveCollection('gym_equipment', equipment);
  },

  async getSuppliers(): Promise<GymSupplier[]> {
    await delay(50);
    return db.getCollection<GymSupplier>('gym_suppliers');
  },

  async getPOs(): Promise<GymPurchaseOrder[]> {
    await delay(100);
    return db.getCollection<GymPurchaseOrder>('gym_pos');
  },

  async savePOs(pos: GymPurchaseOrder[]): Promise<void> {
    db.saveCollection('gym_pos', pos);
  },

  // Legacy API mappings to keep types valid
  async getAll(): Promise<InventoryItem[]> {
    await delay(100);
    const prds = db.getCollection<GymProduct>('gym_products');
    return prds.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category === 'supplements' ? 'supplement' : 'other',
      quantity: p.currentStock,
      minStockLevel: p.minStock,
      unitPrice: p.sellingPrice,
      supplier: p.supplierName,
      status: p.currentStock <= p.minStock ? 'low_stock' : 'in_stock'
    }));
  },

  async create(item: any): Promise<InventoryItem> {
    await delay(100);
    const prds = db.getCollection<GymProduct>('gym_products');
    const newPrd: GymProduct = {
      id: `PRD-${Date.now().toString().slice(-3)}`,
      name: item.name,
      sku: `SKU-${Date.now()}`,
      category: 'supplements',
      brand: 'Generic',
      supplierName: item.supplier,
      purchasePrice: item.unitPrice * 0.6,
      sellingPrice: item.unitPrice,
      currentStock: item.quantity,
      minStock: item.minStockLevel,
      maxStock: item.quantity * 2,
      unit: 'units',
      gstPercent: 18,
      location: 'Store A',
      status: 'active',
      description: ''
    };
    prds.push(newPrd);
    db.saveCollection('gym_products', prds);
    return {
      id: newPrd.id,
      name: newPrd.name,
      category: 'supplement',
      quantity: newPrd.currentStock,
      minStockLevel: newPrd.minStock,
      unitPrice: newPrd.sellingPrice,
      supplier: newPrd.supplierName,
      status: 'in_stock'
    };
  },

  async update(item: any): Promise<InventoryItem> {
    await delay(100);
    return item;
  },

  async delete(id: string): Promise<void> {
    await delay(100);
  }
};

export interface MockPaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'upi' | 'credit_card' | 'gateway' | 'qr';
  membershipName: string;
  referenceNumber?: string;
  screenshotProof?: string; // Base64 or mock URL
}

export const paymentService = {
  async getAll(): Promise<MockPaymentRecord[]> {
    await delay(100);
    return db.getCollection<MockPaymentRecord>('gym_payments');
  },

  async create(payment: MockPaymentRecord): Promise<MockPaymentRecord> {
    await delay(150);
    const list = db.getCollection<MockPaymentRecord>('gym_payments');
    list.unshift(payment);
    db.saveCollection('gym_payments', list);
    return payment;
  },

  async update(payment: MockPaymentRecord): Promise<MockPaymentRecord> {
    await delay(150);
    const list = db.getCollection<MockPaymentRecord>('gym_payments');
    const idx = list.findIndex(p => p.id === payment.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...payment };
      db.saveCollection('gym_payments', list);
      return list[idx];
    }
    throw new Error('Payment record not found.');
  }
};

export const workoutService = {
  async getAll(): Promise<WorkoutPlan[]> {
    await delay(100);
    return db.getCollection<WorkoutPlan>('gym_workout_templates');
  },

  async getAssigned(): Promise<any[]> {
    await delay(100);
    return db.getCollection('gym_workouts');
  },

  async saveAssigned(list: any[]): Promise<void> {
    db.saveCollection('gym_workouts', list);
  },

  async create(plan: WorkoutPlan): Promise<WorkoutPlan> {
    await delay(150);
    const list = db.getCollection<WorkoutPlan>('gym_workout_templates');
    list.push(plan);
    db.saveCollection('gym_workout_templates', list);
    return plan;
  },

  async update(plan: WorkoutPlan): Promise<WorkoutPlan> {
    await delay(150);
    const list = db.getCollection<WorkoutPlan>('gym_workout_templates');
    const idx = list.findIndex(w => w.id === plan.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...plan };
      db.saveCollection('gym_workout_templates', list);
      return list[idx];
    }
    throw new Error('Workout plan template not found.');
  },

  async delete(id: string): Promise<void> {
    await delay(100);
  }
};

export const dietService = {
  async getAll(): Promise<DietPlan[]> {
    await delay(100);
    return db.getCollection<DietPlan>('gym_diet_templates');
  },

  async getAssigned(): Promise<any[]> {
    await delay(100);
    return db.getCollection('gym_diets');
  },

  async saveAssigned(list: any[]): Promise<void> {
    db.saveCollection('gym_diets', list);
  },

  async create(plan: DietPlan): Promise<DietPlan> {
    await delay(150);
    const list = db.getCollection<DietPlan>('gym_diet_templates');
    list.push(plan);
    db.saveCollection('gym_diet_templates', list);
    return plan;
  },

  async update(plan: DietPlan): Promise<DietPlan> {
    await delay(150);
    const list = db.getCollection<DietPlan>('gym_diet_templates');
    const idx = list.findIndex(d => d.id === plan.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...plan };
      db.saveCollection('gym_diet_templates', list);
      return list[idx];
    }
    throw new Error('Diet plan template not found.');
  },

  async delete(id: string): Promise<void> {
    await delay(100);
  }
};

export const transferService = {
  async getAll(): Promise<CoachTransferHistory[]> {
    await delay(100);
    return db.getCollection<CoachTransferHistory>('gym_transfer_history');
  },

  async transferCoach(clientId: string, toCoachId: string, reason: string): Promise<void> {
    await delay(150);
    const clients = db.getCollection<Client>('gym_clients');
    const coaches = db.getCollection<Coach>('gym_coaches');
    const transfers = db.getCollection<CoachTransferHistory>('gym_transfer_history');

    const client = clients.find(c => c.id === clientId);
    const toCoach = coaches.find(co => co.id === toCoachId);

    if (!client || !toCoach) throw new Error('Client or coach not found.');

    const fromCoachId = client.coachId;
    const fromCoachName = fromCoachId ? (coaches.find(co => co.id === fromCoachId)?.name || 'Unassigned') : 'Unassigned';

    // Update Client Roster
    client.coachId = toCoachId;
    db.saveCollection('gym_clients', clients);

    // Record Transfer History
    const newTransfer: CoachTransferHistory = {
      id: `TRF-${Date.now()}`,
      clientId,
      clientName: client.name,
      fromCoachId,
      fromCoachName,
      toCoachId,
      toCoachName: toCoach.name,
      transferredBy: 'System Administrator',
      transferDate: new Date().toISOString().split('T')[0],
      reason
    };

    transfers.push(newTransfer);
    db.saveCollection('gym_transfer_history', transfers);
  }
};

export const notificationService = {
  async getAll(): Promise<NotificationRecord[]> {
    await delay(50);
    return db.getCollection<NotificationRecord>('gym_notifications');
  },

  async markAsRead(id: string): Promise<void> {
    const list = db.getCollection<NotificationRecord>('gym_notifications');
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      db.saveCollection('gym_notifications', list);
    }
  },

  async markAllAsRead(): Promise<void> {
    const list = db.getCollection<NotificationRecord>('gym_notifications');
    list.forEach(n => {
      n.read = true;
    });
    db.saveCollection('gym_notifications', list);
  },

  async create(notification: Omit<NotificationRecord, 'id' | 'read' | 'date'>): Promise<NotificationRecord> {
    const list = db.getCollection<NotificationRecord>('gym_notifications');
    const newNotif: NotificationRecord = {
      ...notification,
      id: `NOT-${Date.now()}`,
      read: false,
      date: new Date().toISOString()
    };
    list.unshift(newNotif);
    db.saveCollection('gym_notifications', list);
    return newNotif;
  }
};

export const reportService = {
  async getAll(): Promise<ReportSummary[]> {
    await delay(100);
    const clients = db.getCollection<Client>('gym_clients');
    const payments = db.getCollection<MockPaymentRecord>('gym_payments');
    
    const activeCount = clients.filter(c => c.status === 'active').length;
    const paidSum = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);

    // Calculate dynamic breakdowns
    const membershipSum = payments
      .filter(p => p.status === 'paid' && p.membershipName && p.membershipName !== 'One-time' && !p.membershipName.toLowerCase().includes('pt') && !p.membershipName.toLowerCase().includes('personal'))
      .reduce((acc, p) => acc + p.amount, 0);

    const ptSum = payments
      .filter(p => p.status === 'paid' && p.membershipName && (p.membershipName.toLowerCase().includes('pt') || p.membershipName.toLowerCase().includes('personal')))
      .reduce((acc, p) => acc + p.amount, 0);

    const inventorySum = payments
      .filter(p => p.status === 'paid' && p.membershipName === 'One-time')
      .reduce((acc, p) => acc + p.amount, 0);

    const attendanceCount = clients.length > 0
      ? Math.round(clients.reduce((acc, c) => acc + (c.attendanceRate || 0), 0) / clients.length)
      : 0;

    const coaches = db.getCollection<Coach>('gym_coaches');
    const topCoaches = coaches
      .map(co => {
        const clientCount = clients.filter(c => c.coachId === co.id).length;
        return { name: co.name, clientCount };
      })
      .sort((a, b) => b.clientCount - a.clientCount)
      .slice(0, 3);

    return [
      {
        id: 'rep-curr',
        month: 'July 2026',
        totalRevenue: paidSum,
        activeMemberships: activeCount,
        attendanceRate: attendanceCount,
        topCoaches: topCoaches,
        revenueBreakdown: {
          memberships: membershipSum,
          personalTraining: ptSum,
          inventorySales: inventorySum
        }
      }
    ];
  }
};

export const enquiryService = {
  async getAll(): Promise<EnquiryRecord[]> {
    await delay(100);
    return db.getCollection<EnquiryRecord>('gym_enquiries');
  },

  async save(list: EnquiryRecord[]): Promise<void> {
    db.saveCollection('gym_enquiries', list);
  },

  async create(enquiry: Omit<EnquiryRecord, 'id' | 'status' | 'createdDate'>): Promise<EnquiryRecord> {
    await delay(100);
    const list = db.getCollection<EnquiryRecord>('gym_enquiries');
    const newEnq: EnquiryRecord = {
      ...enquiry,
      id: `ENQ-${String(list.length + 1).padStart(3, '0')}`,
      status: 'new',
      createdDate: new Date().toISOString().split('T')[0]
    };
    list.unshift(newEnq);
    db.saveCollection('gym_enquiries', list);

    // Create Notification
    await notificationService.create({
      title: 'New enquiry received',
      message: `${enquiry.name} submitted an enquiry regarding the ${enquiry.branch} branch.`,
      type: 'info',
      targetRole: 'super_admin',
      enquiryId: newEnq.id
    });

    return newEnq;
  }
};

export const orderService = {
  async getAll(): Promise<OrderRecord[]> {
    await delay(100);
    return db.getCollection<OrderRecord>('gym_orders');
  },

  async create(order: Omit<OrderRecord, 'id' | 'status' | 'createdDate'>): Promise<OrderRecord> {
    await delay(100);
    const list = db.getCollection<OrderRecord>('gym_orders');
    const newOrder: OrderRecord = {
      ...order,
      id: `ORD-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    list.unshift(newOrder);
    db.saveCollection('gym_orders', list);
    return newOrder;
  },

  async save(list: OrderRecord[]): Promise<void> {
    db.saveCollection('gym_orders', list);
  }
};

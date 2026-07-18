/**
 * Gym HR & Membership System - Service Primitives (Stage 1 Placeholders)
 */

import { Client, Coach, Staff, Membership, InventoryItem, PaymentRecord, WorkoutPlan, DietPlan, SystemNotification, ReportSummary, CoachTransferHistory } from '@/types';

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const clientService = {
  async getAll(): Promise<Client[]> {
    await delay();
    return [];
  },
  async getById(id: string): Promise<Client | undefined> {
    await delay();
    return undefined;
  },
  async create(client: any): Promise<Client> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(client: any): Promise<Client> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const coachService = {
  async getAll(): Promise<Coach[]> {
    await delay();
    return [];
  },
  async create(coach: any): Promise<Coach> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(coach: any): Promise<Coach> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const staffService = {
  async getAll(): Promise<Staff[]> {
    await delay();
    return [];
  },
  async create(staff: any): Promise<Staff> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(staff: any): Promise<Staff> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const membershipService = {
  async getAll(): Promise<Membership[]> {
    await delay();
    return [];
  },
  async create(membership: any): Promise<Membership> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(membership: any): Promise<Membership> {
    await delay();
    throw new Error('Service placeholder mode.');
  }
};

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    await delay();
    return [];
  },
  async create(item: any): Promise<InventoryItem> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(item: any): Promise<InventoryItem> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const paymentService = {
  async getAll(): Promise<PaymentRecord[]> {
    await delay();
    return [];
  },
  async create(payment: any): Promise<PaymentRecord> {
    await delay();
    throw new Error('Service placeholder mode.');
  }
};

export const workoutService = {
  async getAll(): Promise<WorkoutPlan[]> {
    await delay();
    return [];
  },
  async create(plan: any): Promise<WorkoutPlan> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(plan: any): Promise<WorkoutPlan> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const dietService = {
  async getAll(): Promise<DietPlan[]> {
    await delay();
    return [];
  },
  async create(plan: any): Promise<DietPlan> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async update(plan: any): Promise<DietPlan> {
    await delay();
    throw new Error('Service placeholder mode.');
  },
  async delete(id: string): Promise<void> {
    await delay();
  }
};

export const transferService = {
  async getAll(): Promise<CoachTransferHistory[]> {
    await delay();
    return [];
  },
  async transferCoach(clientId: string, toCoachId: string, reason: string): Promise<void> {
    await delay();
  }
};

export const notificationService = {
  async getAll(): Promise<SystemNotification[]> {
    await delay();
    return [];
  },
  async markAsRead(id: string): Promise<void> {
    await delay();
  },
  async markAllAsRead(): Promise<void> {
    await delay();
  },
  async create(notification: any): Promise<SystemNotification> {
    await delay();
    throw new Error('Service placeholder mode.');
  }
};

export const reportService = {
  async getAll(): Promise<ReportSummary[]> {
    await delay();
    return [];
  }
};

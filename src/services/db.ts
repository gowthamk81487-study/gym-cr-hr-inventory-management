/**
 * Centralized Mock Database Layer
 * The Gym Fitness Club CRM & HR System
 * Manages state in localStorage for real-time persistence across route changes
 */

import { mockClients, mockCoaches } from '@/mock/clients';
import { mockMemberships } from '@/mock/data';
import { mockProducts, mockEquipment, mockSuppliers, mockPurchaseOrders } from '@/mock/inventory';
import { mockAssignedWorkouts, mockAssignedDiets, mockWorkoutTemplates, mockDietTemplates, mockMeals, mockExercises } from '@/mock/fitness';
import { mockAttendanceLogs } from '@/mock/attendance';
import { Staff } from '@/types';

export interface UserRecord {
  email: string;
  passwordHash: string; // Plain password for simple mock comparisons
  role: 'super_admin' | 'manager' | 'coach' | 'client';
  entityId?: string; // Links to client or coach profile
  status: 'active' | 'suspended';
  forcePasswordReset?: boolean;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  message: string;
  status: 'new' | 'in_progress' | 'replied' | 'closed' | 'converted' | 'rejected';
  assignedManager?: string;
  contactNotes?: string;
  createdDate: string;
}

export interface OrderRecord {
  id: string;
  clientId: string;
  clientName: string;
  items: { productId: string; name: string; quantity: number; price: number; brand: string }[];
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'shipped' | 'delivered';
  createdDate: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
  targetRole?: string;
  targetUserId?: string; // Linked to client or coach email/id
  enquiryId?: string;
}

const isClient = typeof window !== 'undefined';

const getLS = (key: string) => {
  if (!isClient) return null;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

const setLS = (key: string, data: any) => {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const initDB = () => {
  if (!isClient) return;

  // Initialize Users
  if (!localStorage.getItem('gym_users')) {
    const initialUsers: UserRecord[] = [
      {
        email: 'gowtham@thegymfitnesshub.in',
        passwordHash: 'Gowtham@140707',
        role: 'super_admin',
        status: 'active'
      },
      {
        email: 'manager@thegymfitnesshub.in',
        passwordHash: 'Manager@123',
        role: 'manager',
        status: 'active'
      },
      {
        email: 'coach1001@thegymfitnesshub.in',
        passwordHash: 'Coach1001@123',
        role: 'coach',
        entityId: 'coach-1',
        status: 'active'
      }
    ];
    setLS('gym_users', initialUsers);
  }

  // Initialize Clients (Empty initially)
  if (!localStorage.getItem('gym_clients')) {
    setLS('gym_clients', []);
  }

  // Initialize Coaches (Empty initially)
  if (!localStorage.getItem('gym_coaches')) {
    setLS('gym_coaches', []);
  }

  // Initialize Memberships (Empty initially)
  if (!localStorage.getItem('gym_memberships')) {
    setLS('gym_memberships', []);
  }

  // Initialize Products (Empty list to fill via Inventory admin panel)
  if (!localStorage.getItem('gym_products')) {
    setLS('gym_products', []);
  }

  // Initialize Equipment
  if (!localStorage.getItem('gym_equipment')) {
    setLS('gym_equipment', []);
  }

  // Initialize Suppliers
  if (!localStorage.getItem('gym_suppliers')) {
    setLS('gym_suppliers', []);
  }

  // Initialize POs
  if (!localStorage.getItem('gym_pos')) {
    setLS('gym_pos', []);
  }

  // Initialize Workouts
  if (!localStorage.getItem('gym_workouts')) {
    setLS('gym_workouts', []);
  }

  // Initialize Diets
  if (!localStorage.getItem('gym_diets')) {
    setLS('gym_diets', []);
  }

  // Initialize Templates
  if (!localStorage.getItem('gym_workout_templates')) {
    setLS('gym_workout_templates', []);
  }
  if (!localStorage.getItem('gym_diet_templates')) {
    setLS('gym_diet_templates', []);
  }

  // Initialize Attendance
  if (!localStorage.getItem('gym_attendance')) {
    setLS('gym_attendance', []);
  }

  // Initialize Enquiries
  if (!localStorage.getItem('gym_enquiries')) {
    setLS('gym_enquiries', []);
  }

  // Initialize Orders
  if (!localStorage.getItem('gym_orders')) {
    setLS('gym_orders', []);
  }

  // Initialize Staff (Empty initially)
  if (!localStorage.getItem('gym_staff')) {
    setLS('gym_staff', []);
  }

  // Initialize Payments
  if (!localStorage.getItem('gym_payments')) {
    setLS('gym_payments', []);
  }

  // Initialize Notifications
  if (!localStorage.getItem('gym_notifications')) {
    setLS('gym_notifications', []);
  }
};

// Database Accessors
export const db = {
  getCollection<T>(key: string): T[] {
    initDB();
    return getLS(key) || [];
  },

  saveCollection<T>(key: string, data: T[]): void {
    setLS(key, data);
  },

  getItem<T>(key: string): T | null {
    return getLS(key);
  },

  setItem<T>(key: string, data: T): void {
    setLS(key, data);
  }
};

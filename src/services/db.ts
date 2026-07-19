/**
 * Centralized Mock Database Layer
 * Provolution Club CRM & HR System
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
  status: 'new' | 'contacted' | 'pr_week_scheduled' | 'converted' | 'rejected';
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

  // Initialize Clients
  if (!localStorage.getItem('gym_clients')) {
    setLS('gym_clients', mockClients);
  }

  // Initialize Coaches
  if (!localStorage.getItem('gym_coaches')) {
    setLS('gym_coaches', mockCoaches);
  }

  // Initialize Memberships
  if (!localStorage.getItem('gym_memberships')) {
    setLS('gym_memberships', mockMemberships);
  }

  // Initialize Products
  if (!localStorage.getItem('gym_products')) {
    setLS('gym_products', mockProducts);
  }

  // Initialize Equipment
  if (!localStorage.getItem('gym_equipment')) {
    setLS('gym_equipment', mockEquipment);
  }

  // Initialize Suppliers
  if (!localStorage.getItem('gym_suppliers')) {
    setLS('gym_suppliers', mockSuppliers);
  }

  // Initialize POs
  if (!localStorage.getItem('gym_pos')) {
    setLS('gym_pos', mockPurchaseOrders);
  }

  // Initialize Workouts
  if (!localStorage.getItem('gym_workouts')) {
    setLS('gym_workouts', mockAssignedWorkouts);
  }

  // Initialize Diets
  if (!localStorage.getItem('gym_diets')) {
    setLS('gym_diets', mockAssignedDiets);
  }

  // Initialize Templates
  if (!localStorage.getItem('gym_workout_templates')) {
    setLS('gym_workout_templates', mockWorkoutTemplates);
  }
  if (!localStorage.getItem('gym_diet_templates')) {
    setLS('gym_diet_templates', mockDietTemplates);
  }

  // Initialize Attendance
  if (!localStorage.getItem('gym_attendance')) {
    setLS('gym_attendance', mockAttendanceLogs);
  }

  // Initialize Enquiries
  if (!localStorage.getItem('gym_enquiries')) {
    const initialEnquiries: EnquiryRecord[] = [
      {
        id: 'ENQ-001',
        name: 'Gowtham Raj',
        email: 'gowtham14072006@thegymfitnesshub.in',
        phone: '+91 9876543210',
        branch: 'downtown',
        message: 'Looking to enroll in the 7 Day PR Starter Program CrossFit schedule.',
        status: 'new',
        createdDate: '2026-07-18'
      }
    ];
    setLS('gym_enquiries', initialEnquiries);
  }

  // Initialize Orders
  if (!localStorage.getItem('gym_orders')) {
    setLS('gym_orders', []);
  }

  // Initialize Staff
  if (!localStorage.getItem('gym_staff')) {
    const initialStaff: Staff[] = [
      {
        id: 'STF-001',
        name: 'Alexander Pierce',
        email: 'manager@thegymfitnesshub.in',
        phone: '+1 (555) 019-8801',
        role: 'manager',
        status: 'active',
        hireDate: '2023-01-15',
        salary: 4500
      },
      {
        id: 'STF-002',
        name: 'Danny Pink',
        email: 'danny@thegymfitnesshub.in',
        phone: '+1 (555) 019-8802',
        role: 'receptionist',
        status: 'active',
        hireDate: '2024-05-10',
        salary: 2200
      },
      {
        id: 'STF-003',
        name: 'Clara Oswald',
        email: 'clara@thegymfitnesshub.in',
        role: 'admin',
        phone: '+1 (555) 019-8803',
        status: 'active',
        hireDate: '2023-08-20',
        salary: 3500
      }
    ];
    setLS('gym_staff', initialStaff);
  }

  // Initialize Payments
  if (!localStorage.getItem('gym_payments')) {
    setLS('gym_payments', []);
  }

  // Initialize Notifications
  if (!localStorage.getItem('gym_notifications')) {
    const initialNotifications: NotificationRecord[] = [
      {
        id: 'NOT-1',
        title: 'New enquiry received',
        message: 'Gowtham Raj submitted an enquiry regarding PR Starter Program.',
        type: 'info',
        read: false,
        date: new Date().toISOString(),
        targetRole: 'super_admin'
      },
      {
        id: 'NOT-2',
        title: 'Low inventory alert',
        message: 'Whey Protein Hydrolyzed stock is below minimum threshold limit.',
        type: 'warning',
        read: false,
        date: new Date().toISOString(),
        targetRole: 'manager'
      }
    ];
    setLS('gym_notifications', initialNotifications);
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

// Gym HR, Membership & Client Continuity Management System Types

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: string;
  coachId: string | null;
  profilePic?: string;
  attendanceRate: number; // Percentage
  paymentStatus: 'paid' | 'unpaid' | 'overdue';
  gender: 'male' | 'female' | 'other';
  age: number;
  dob: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health';
  medicalConditions?: string;
  allergies?: string;
  workoutPlanId?: string;
  dietPlanId?: string;
  lastVisitDate?: string;
  renewalDate: string;
  notes?: string;
  tags?: string[];
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  role: 'head_coach' | 'personal_trainer' | 'nutritionist' | 'physiotherapist';
  status: 'active' | 'on_leave' | 'inactive';
  hireDate: string;
  activeClientsCount: number;
  profilePic?: string;
  bio?: string;
  experienceYears?: number;
  maxCapacity?: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'receptionist' | 'cleaner';
  status: 'active' | 'on_leave' | 'inactive';
  hireDate: string;
  salary: number;
}

export interface CoachAssignment {
  id: string;
  clientId: string;
  clientName: string;
  coachId: string;
  coachName: string;
  assignedDate: string;
}

export interface CoachTransferHistory {
  id: string;
  clientId: string;
  clientName: string;
  fromCoachId: string | null;
  fromCoachName: string;
  toCoachId: string;
  toCoachName: string;
  transferredBy: string;
  transferDate: string;
  reason: string;
}

export interface Membership {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'vip';
  price: number;
  durationMonths: number;
  benefits: string[];
  status: 'active' | 'deprecated';
  billingPeriod?: 'monthly' | 'quarterly' | 'yearly';
  features?: string[];
  isPopular?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'equipment' | 'supplement' | 'apparel' | 'beverage' | 'other';
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';
  membershipName: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "10-12" or "As many as possible"
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  goal: 'muscle_gain' | 'weight_loss' | 'cardio' | 'flexibility' | 'general_fitness';
  level: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  createdDate: string;
}

export interface Meal {
  mealName: 'breakfast' | 'snack_1' | 'lunch' | 'snack_2' | 'dinner';
  items: string[];
}

export interface DietPlan {
  id: string;
  name: string;
  calorieTarget: number;
  macronutrients: {
    carbs: number; // grams
    protein: number; // grams
    fat: number; // grams
  };
  mealSchedule: Meal[];
  createdDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ReportSummary {
  id: string;
  month: string;
  totalRevenue: number;
  activeMemberships: number;
  attendanceRate: number; // percentage
  topCoaches: Array<{ name: string; clientCount: number }>;
  revenueBreakdown: {
    memberships: number;
    personalTraining: number;
    inventorySales: number;
  };
}

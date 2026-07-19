import { Membership, Coach, Testimonial } from '@/types';

// 1. Membership Plans
export const mockMemberships: Membership[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    type: 'monthly',
    price: 49,
    durationMonths: 1,
    benefits: ['All club hours access', 'Locker room access', 'Basic cardio/weights gym floor', '1 guest pass per month'],
    status: 'active',
    billingPeriod: 'monthly',
    features: ['All club hours access', 'Locker room access', 'Basic cardio/weights gym floor', '1 guest pass per month'],
    isPopular: false
  },
  {
    id: 'elite-quarterly',
    name: 'Elite Quarterly',
    type: 'quarterly',
    price: 129,
    durationMonths: 3,
    benefits: ['All basic features', 'Free Group Fitness classes', '2 coaching consultations', '4 guest passes per quarter'],
    status: 'active',
    billingPeriod: 'quarterly',
    features: ['All basic features', 'Free Group Fitness classes', '2 coaching consultations', '4 guest passes per quarter'],
    isPopular: true
  },
  {
    id: 'premium-vip-yearly',
    name: 'Premium VIP Yearly',
    type: 'vip',
    price: 449,
    durationMonths: 12,
    benefits: ['24/7 all club accesses', 'All elite features', 'Unlimited Personal Training hours', 'Dedicated private locker', 'Unlimited guest passes', 'Monthly body composition checks'],
    status: 'active',
    billingPeriod: 'yearly',
    features: ['24/7 all club accesses', 'All elite features', 'Unlimited Personal Training hours', 'Dedicated private locker', 'Unlimited guest passes', 'Monthly body composition checks'],
    isPopular: false
  }
];

// 2. Trainer Profiles
export const mockTrainers: Coach[] = [
  {
    id: 'coach-1',
    name: 'Coach Marcus Sterling',
    email: 'marcus@thegymfitnesshub.in',
    phone: '+1 (555) 019-1111',
    specialization: 'Powerlifting & Strength',
    role: 'head_coach',
    status: 'active',
    hireDate: '2022-01-10',
    activeClientsCount: 15,
    profilePic: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Former competitive powerlifter with 12+ years coaching. Expert in barbell compound lift adjustments.',
    experienceYears: 12
  },
  {
    id: 'coach-2',
    name: 'Coach Elena Rostova',
    email: 'elena@thegymfitnesshub.in',
    phone: '+1 (555) 019-2222',
    specialization: 'HIIT & Functional Fitness',
    role: 'personal_trainer',
    status: 'active',
    hireDate: '2023-03-15',
    activeClientsCount: 22,
    profilePic: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Accredited athletic conditioner specializing in metabolic endurance workouts and injury recovery.',
    experienceYears: 8
  },
  {
    id: 'coach-3',
    name: 'Coach Damien Vance',
    email: 'damien@thegymfitnesshub.in',
    phone: '+1 (555) 019-3333',
    specialization: 'Body Recomposition & Nutrition',
    role: 'nutritionist',
    status: 'active',
    hireDate: '2021-08-20',
    activeClientsCount: 10,
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Coached 200+ weight loss transformations. Integrates strict dietary macronutrient planning with hypertrophic lifting.',
    experienceYears: 10
  }
];

// 3. Testimonials
export interface TestimonialDetails {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  beforeWeight?: string;
  afterWeight?: string;
  duration?: string;
}

export const mockTestimonials: TestimonialDetails[] = [
  {
    id: 'test-1',
    name: 'Sarah Jenkins',
    role: 'Corporate Member',
    quote: 'Elena designed a specialized functional schedule that fit my 50-hour work week. Dropped body fat percentage by 12% in 3 months!',
    rating: 5,
    beforeWeight: '168 lbs',
    afterWeight: '142 lbs',
    duration: '12 weeks'
  },
  {
    id: 'test-2',
    name: 'David Vance',
    role: 'VIP Member',
    quote: 'The powerlifting techniques Marcus coached fixed my lower back posture and pushed my squat past 400 lbs. Highly professional staff.',
    rating: 5,
    beforeWeight: '195 lbs',
    afterWeight: '205 lbs (muscle gain)',
    duration: '6 months'
  },
  {
    id: 'test-3',
    name: 'Sophia Liang',
    role: 'Standard Member',
    quote: 'Elite nutrition sheets and diet tracking stubs transformed my energy levels. Clean facilities, gorgeous equipment.',
    rating: 5,
    beforeWeight: '150 lbs',
    afterWeight: '135 lbs',
    duration: '8 weeks'
  }
];

// 4. Facilities Info
export const mockFacilities = [
  { title: 'Barbell Zones', desc: 'Over 8 dedicated Olympic platform cages and calibrated weight plates.' },
  { title: 'Cardio Suites', desc: 'Sleek curved self-powered treadmills, rowers, and assault cycles.' },
  { title: 'Recovery Lounges', desc: 'High-end infrared saunas, cryotherapy tubs, and compression boots.' }
];

// 5. Frequently Asked Questions
export const mockFaqs = [
  { q: 'Can I trial the gym before purchasing a membership?', a: 'Yes, we provide a 1-day guest pass for local residents. Bring a government ID on your first visit.' },
  { q: 'Are personal training sessions included in standard plans?', a: 'Standard plans include gym access. Personal training hours are purchased in coaching bundles or come included in VIP tiers.' },
  { q: 'What is your cancellation policy?', a: 'Membership agreements can be cancelled with a 30-day written notification submitted online or in person.' }
];

// 6. Gallery Items
export const mockGallery = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300&h=200',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300&h=200'
];

// 7. Dashboard Metrics Statistics
export const mockDashboardStats = {
  totalMembers: 645,
  activeMemberships: 590,
  revenue: 15420,
  coaches: 8,
  employees: 14,
  inventoryAlerts: 3,
  attendanceToday: 180,
  pendingRenewals: 8
};

// 8. Recent Activities Log Feed
export const mockActivities = [
  { id: 'act-1', time: '10 mins ago', type: 'registration', desc: 'Sarah Jenkins enrolled in basic-monthly tier.' },
  { id: 'act-2', time: '35 mins ago', type: 'transfer', desc: 'Client David Vance assigned to Coach Marcus Sterling.' },
  { id: 'act-3', time: '1 hour ago', type: 'payment', desc: 'Cleared invoice #INV-9284 for $129 (Elite Plan).' },
  { id: 'act-4', time: '2 hours ago', type: 'login', desc: 'Coach Elena Rostova checked in to Downtown HQ.' }
];

// 9. Dashboard Low Stock / Expiry Warnings
export const mockAlerts = {
  inventory: [
    { name: 'Whey Protein Hydrolyzed', qty: 2, threshold: 10, category: 'supplement' },
    { name: 'The Gym Fitness Club Core Tee (Medium)', qty: 4, threshold: 15, category: 'apparel' }
  ],
  renewals: [
    { name: 'Marcus Sterling', plan: 'VIP Yearly', expiryDate: '2026-07-28' },
    { name: 'Sophia Liang', plan: 'Standard Monthly', expiryDate: '2026-07-25' }
  ]
};


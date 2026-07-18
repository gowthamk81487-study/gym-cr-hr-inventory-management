// Mock dataset for Gym Membership Lifecycle Management System

export interface GymMembershipPlan {
  id: string;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  discount: number;
  gstPercent: number; // Configurable tax
  enrollmentFee: number;
  renewalFee: number;
  freezeAllowed: boolean;
  maxFreezeDays: number;
  transferAllowed: boolean;
  guestPassCount: number;
  ptSessionsCount: number;
  dietConsultsCount: number;
  workoutConsultsCount: number;
  accessTiming: '24_7' | 'off_peak' | 'daytime' | 'weekends_only';
  status: 'active' | 'archived';
  notes?: string;
}

export interface ClientMembershipRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  planId: string;
  status: 'pending' | 'active' | 'expiring_soon' | 'expired' | 'frozen' | 'cancelled' | 'transferred' | 'renewed' | 'completed';
  joinDate: string;
  expirationDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'overdue';
  durationMonths: number;
  lastVisitDate?: string;
  renewalHistory: { renewalDate: string; amountPaid: number; method: string }[];
  freezeHistory: { startDate: string; endDate: string; reason: string }[];
  notes?: string;
}

// 1. Roster of 15 Membership Plans
export const mockMembershipPlans: GymMembershipPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    description: 'Access to general cardio and weight training floors during standard operating hours.',
    durationMonths: 1,
    price: 49,
    discount: 0,
    gstPercent: 18,
    enrollmentFee: 20,
    renewalFee: 49,
    freezeAllowed: false,
    maxFreezeDays: 0,
    transferAllowed: false,
    guestPassCount: 1,
    ptSessionsCount: 0,
    dietConsultsCount: 0,
    workoutConsultsCount: 1,
    accessTiming: 'daytime',
    status: 'active',
    notes: 'Entry level plan. Ideal for self-directed lifters.'
  },
  {
    id: 'elite-quarterly',
    name: 'Elite Quarterly',
    description: 'Full multi-club access including group yoga and HIIT classes.',
    durationMonths: 3,
    price: 129,
    discount: 10,
    gstPercent: 18,
    enrollmentFee: 20,
    renewalFee: 119,
    freezeAllowed: true,
    maxFreezeDays: 15,
    transferAllowed: true,
    guestPassCount: 4,
    ptSessionsCount: 2,
    dietConsultsCount: 1,
    workoutConsultsCount: 2,
    accessTiming: '24_7',
    status: 'active',
    notes: 'Popular mid-tier option.'
  },
  {
    id: 'premium-vip-yearly',
    name: 'Premium VIP Yearly',
    description: 'All-inclusive premium subscription: private lockers, laundry service, and unlimited guest passes.',
    durationMonths: 12,
    price: 449,
    discount: 50,
    gstPercent: 18,
    enrollmentFee: 0,
    renewalFee: 399,
    freezeAllowed: true,
    maxFreezeDays: 60,
    transferAllowed: true,
    guestPassCount: 12,
    ptSessionsCount: 12,
    dietConsultsCount: 4,
    workoutConsultsCount: 6,
    accessTiming: '24_7',
    status: 'active',
    notes: 'Flagship VIP tier.'
  },
  // 12 Plan Stubs to satisfy 15 Plans requirement
  ...[
    { id: 'offpeak-monthly', name: 'Off-Peak Monthly', price: 29, duration: 1, timing: 'off_peak' as const },
    { id: 'student-annual', name: 'Student Annual Discount', price: 299, duration: 12, timing: '24_7' as const },
    { id: 'corporate-yearly', name: 'Corporate Platinum', price: 349, duration: 12, timing: '24_7' as const },
    { id: 'weekend-warrior', name: 'Weekend Warrior', price: 19, duration: 1, timing: 'weekends_only' as const },
    { id: 'family-pack-quarterly', name: 'Family Pack Quarterly', price: 249, duration: 3, timing: '24_7' as const },
    { id: 'senior-silver-monthly', name: 'Senior Silver Monthly', price: 25, duration: 1, timing: 'daytime' as const },
    { id: 'beastmode-halfyear', name: 'Beastmode 6-Month', price: 219, duration: 6, timing: '24_7' as const },
    { id: 'cardio-core-monthly', name: 'Cardio Core Monthly', price: 39, duration: 1, timing: 'daytime' as const },
    { id: 'flex-pass-10', name: 'Flex Pass 10-Visit', price: 59, duration: 3, timing: 'daytime' as const },
    { id: 'recovery-lounge-monthly', name: 'Recovery Lounge Access', price: 89, duration: 1, timing: '24_7' as const },
    { id: 'early-bird-yearly', name: 'Early Bird Annual', price: 189, duration: 12, timing: 'daytime' as const },
    { id: 'deprecated-standard', name: 'Deprecated Classic Standard', price: 39, duration: 1, timing: 'daytime' as const, status: 'archived' as const }
  ].map(p => ({
    id: p.id,
    name: p.name,
    description: `Custom subscription plan offering specialized ${p.timing} operating permissions.`,
    durationMonths: p.duration,
    price: p.price,
    discount: 0,
    gstPercent: 18,
    enrollmentFee: 15,
    renewalFee: p.price,
    freezeAllowed: p.duration > 1,
    maxFreezeDays: p.duration > 3 ? 30 : 0,
    transferAllowed: false,
    guestPassCount: p.duration,
    ptSessionsCount: 0,
    dietConsultsCount: 0,
    workoutConsultsCount: 1,
    accessTiming: p.timing,
    status: p.status || ('active' as const),
    notes: 'Specialized membership tier.'
  }))
];

// Helper to generate 100 realistic client memberships
function generateClientMemberships(): ClientMembershipRecord[] {
  const list: ClientMembershipRecord[] = [
    {
      id: 'MEM-001',
      clientId: 'CL-001',
      clientName: 'Sarah Jenkins',
      clientPhone: '+1 (555) 019-2834',
      planId: 'basic-monthly',
      status: 'active',
      joinDate: '2026-01-15',
      expirationDate: '2026-08-15',
      paymentStatus: 'paid',
      durationMonths: 1,
      lastVisitDate: '2026-07-17',
      renewalHistory: [
        { renewalDate: '2026-06-15', amountPaid: 49, method: 'Stripe Credit' },
        { renewalDate: '2026-07-15', amountPaid: 49, method: 'Stripe Credit' }
      ],
      freezeHistory: [],
      notes: 'Transitioned via CRM. Continues on basic plan.'
    },
    {
      id: 'MEM-002',
      clientId: 'CL-002',
      clientName: 'David Vance',
      clientPhone: '+1 (555) 019-4567',
      planId: 'premium-vip-yearly',
      status: 'active',
      joinDate: '2026-02-10',
      expirationDate: '2027-02-10',
      paymentStatus: 'paid',
      durationMonths: 12,
      lastVisitDate: '2026-07-18',
      renewalHistory: [],
      freezeHistory: [
        { startDate: '2026-04-01', endDate: '2026-04-10', reason: 'Business travel trip' }
      ],
      notes: 'VIP client file. Handled via master coach.'
    },
    {
      id: 'MEM-003',
      clientId: 'CL-003',
      clientName: 'Sophia Liang',
      clientPhone: '+1 (555) 019-8901',
      planId: 'elite-quarterly',
      status: 'expiring_soon',
      joinDate: '2026-04-20',
      expirationDate: '2026-07-23', // Expiring in a few days
      paymentStatus: 'paid',
      durationMonths: 3,
      lastVisitDate: '2026-07-16',
      renewalHistory: [],
      freezeHistory: [],
      notes: 'Renewal reminder sent. High possibility of upgrading.'
    },
    {
      id: 'MEM-004',
      clientId: 'CL-004',
      clientName: 'Marcus Miller',
      clientPhone: '+1 (555) 019-4401',
      planId: 'basic-monthly',
      status: 'frozen',
      joinDate: '2026-05-10',
      expirationDate: '2026-09-10',
      paymentStatus: 'paid',
      durationMonths: 1,
      lastVisitDate: '2026-06-12',
      renewalHistory: [],
      freezeHistory: [
        { startDate: '2026-06-15', endDate: '2026-07-25', reason: 'Medical: Shoulder strain' }
      ],
      notes: 'Subscription frozen until medical clearance.'
    },
    {
      id: 'MEM-005',
      clientId: 'CL-005',
      clientName: 'Elena Jenkins',
      clientPhone: '+1 (555) 019-4402',
      planId: 'elite-quarterly',
      status: 'expired',
      joinDate: '2026-03-01',
      expirationDate: '2026-06-01',
      paymentStatus: 'unpaid',
      durationMonths: 3,
      lastVisitDate: '2026-05-30',
      renewalHistory: [],
      freezeHistory: [],
      notes: 'Expired payment overdue. Reminders sent.'
    }
  ];

  const firstNames = ['John', 'Michael', 'James', 'Robert', 'William', 'Emily', 'Emma', 'Olivia', 'Sophia', 'Jessica', 'David', 'Daniel', 'Lucas', 'Ryan', 'Clara', 'Danny', 'Grace', 'Anna', 'Thomas', 'Ben'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];
  const plans = ['basic-monthly', 'elite-quarterly', 'premium-vip-yearly', 'offpeak-monthly', 'student-annual', 'corporate-yearly'];
  const statuses: ('pending' | 'active' | 'expiring_soon' | 'expired' | 'frozen' | 'cancelled' | 'completed')[] = [
    'active', 'active', 'active', 'active', 'expiring_soon', 'expired', 'frozen', 'cancelled', 'pending'
  ];
  const paymentStatuses: ('paid' | 'unpaid' | 'overdue')[] = ['paid', 'paid', 'paid', 'unpaid', 'overdue'];

  for (let i = 6; i <= 100; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const payment = paymentStatuses[i % paymentStatuses.length];
    
    list.push({
      id: `MEM-${String(i).padStart(3, '0')}`,
      clientId: `CL-${String(i).padStart(3, '0')}`,
      clientName: `${fName} ${lName}`,
      clientPhone: `+1 (555) 019-${String(4000 + i)}`,
      planId: plan,
      status: status,
      joinDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
      expirationDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`,
      paymentStatus: payment,
      durationMonths: plan.includes('annual') || plan.includes('yearly') ? 12 : plan.includes('quarterly') ? 3 : 1,
      lastVisitDate: `2026-07-${String((i % 18) + 1).padStart(2, '0')}`,
      renewalHistory: [],
      freezeHistory: [],
      notes: 'Active subscriber profile. Monitored in Stage 7 Lifecycle database.'
    });
  }

  return list;
}

export const mockClientMemberships = generateClientMemberships();

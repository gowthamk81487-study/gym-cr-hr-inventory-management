import { Client, Coach } from '@/types';

// 1. Roster of 10 Coaches
export const mockCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'Marcus Sterling',
    email: 'marcus@provolution.com',
    phone: '+1 (555) 019-1111',
    specialization: 'Barbell Strength & Powerlifting',
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
    name: 'Elena Rostova',
    email: 'elena@provolution.com',
    phone: '+1 (555) 019-2222',
    specialization: 'HIIT & Cardiorespiratory Endurance',
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
    name: 'Damien Vance',
    email: 'damien@provolution.com',
    phone: '+1 (555) 019-3333',
    specialization: 'Body Recomposition & Nutrition',
    role: 'nutritionist',
    status: 'active',
    hireDate: '2021-08-20',
    activeClientsCount: 10,
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Coached 200+ weight loss transformations. Integrates strict dietary macronutrient planning with hypertrophic lifting.',
    experienceYears: 10
  },
  // 17 Coach Stubs to fulfill the 20 Coaches requirement
  ...[
    { id: 'coach-4', name: 'Sophia Sterling', spec: 'Yoga & Flexibility' },
    { id: 'coach-5', name: 'James Vance', spec: 'Kettlebell & Conditioning' },
    { id: 'coach-6', name: 'Rayan Miller', spec: 'Olympic Weightlifting' },
    { id: 'coach-7', name: 'Lucas Scott', spec: 'Boxing & MMA Conditioning' },
    { id: 'coach-8', name: 'Clara Oswald', spec: 'Pre/Postnatal Fitness' },
    { id: 'coach-9', name: 'Danny Pink', spec: 'Calisthenics & Bodyweight' },
    { id: 'coach-10', name: 'River Song', spec: 'CrossFit & Cardio Core' },
    { id: 'coach-11', name: 'Amy Pond', spec: 'Pilates & Core Strength' },
    { id: 'coach-12', name: 'Rory Williams', spec: 'Cardiorespiratory Endurance' },
    { id: 'coach-13', name: 'Jack Harkness', spec: 'Bootcamp & Strength Training' },
    { id: 'coach-14', name: 'Martha Jones', spec: 'Physiotherapy & Rehab' },
    { id: 'coach-15', name: 'Donna Noble', spec: 'Aqua Aerobics & Aerobic Dance' },
    { id: 'coach-16', name: 'Rose Tyler', spec: 'Functional Strength & Tone' },
    { id: 'coach-17', name: 'Mickey Smith', spec: 'Kickboxing Core Athletics' },
    { id: 'coach-18', name: 'Wilfred Mott', spec: 'Senior Wellness & Balance' },
    { id: 'coach-19', name: 'Sarah Jane', spec: 'Youth Athletics Conditioning' },
    { id: 'coach-20', name: 'John Smith', spec: 'Triathlon & Endurance Coaching' }
  ].map(c => ({
    id: c.id,
    name: c.name,
    email: `${c.id}@provolution.com`,
    phone: '+1 (555) 019-9999',
    specialization: c.spec,
    role: 'personal_trainer' as const,
    status: 'active' as const,
    hireDate: '2024-01-01',
    activeClientsCount: 5,
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Accredited physical conditioner coaching group sessions.',
    experienceYears: 4
  }))
];

// Seed 10 Detailed Client Profiles
const detailedClients: Client[] = [
  {
    id: 'CL-001',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+1 (555) 019-2834',
    membershipId: 'basic-monthly',
    status: 'active',
    joinDate: '2026-01-15',
    coachId: 'coach-2',
    profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    attendanceRate: 85,
    paymentStatus: 'paid',
    gender: 'female',
    age: 28,
    dob: '1998-04-12',
    emergencyContactName: 'Robert Jenkins',
    emergencyContactPhone: '+1 (555) 019-2835',
    bloodGroup: 'O+',
    address: '422 Marina Blvd, San Francisco, CA',
    heightCm: 165,
    weightKg: 64,
    bmi: 23.5,
    fitnessGoal: 'weight_loss',
    medicalConditions: 'None',
    allergies: 'Peanuts',
    workoutPlanId: 'work-1',
    dietPlanId: 'diet-1',
    lastVisitDate: '2026-07-17',
    renewalDate: '2026-08-15',
    notes: 'Motivated client. Prefers HIIT training over heavy weights.',
    tags: ['HIIT', 'Cardio']
  },
  {
    id: 'CL-002',
    name: 'David Vance',
    email: 'david@example.com',
    phone: '+1 (555) 019-4567',
    membershipId: 'premium-vip-yearly',
    status: 'active',
    joinDate: '2026-02-10',
    coachId: 'coach-1',
    profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    attendanceRate: 92,
    paymentStatus: 'paid',
    gender: 'male',
    age: 34,
    dob: '1992-11-20',
    emergencyContactName: 'Laura Vance',
    emergencyContactPhone: '+1 (555) 019-4568',
    bloodGroup: 'A+',
    address: '750 heights Ave, San Francisco, CA',
    heightCm: 182,
    weightKg: 93,
    bmi: 28.1,
    fitnessGoal: 'muscle_gain',
    medicalConditions: 'Minor lower back pain history',
    allergies: 'None',
    workoutPlanId: 'work-2',
    dietPlanId: 'diet-2',
    lastVisitDate: '2026-07-18',
    renewalDate: '2027-02-10',
    notes: 'Powerlifting focus. Calibrate compound squat positions.',
    tags: ['Barbell', 'Powerlifting']
  },
  {
    id: 'CL-003',
    name: 'Sophia Liang',
    email: 'sophia@example.com',
    phone: '+1 (555) 019-8901',
    membershipId: 'elite-quarterly',
    status: 'active',
    joinDate: '2026-03-20',
    coachId: 'coach-3',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    attendanceRate: 78,
    paymentStatus: 'paid',
    gender: 'female',
    age: 26,
    dob: '2000-08-05',
    emergencyContactName: 'Hanson Liang',
    emergencyContactPhone: '+1 (555) 019-8902',
    bloodGroup: 'AB+',
    address: '100 Clay St, San Francisco, CA',
    heightCm: 170,
    weightKg: 58,
    bmi: 20.1,
    fitnessGoal: 'endurance',
    medicalConditions: 'Asthma',
    allergies: 'Dairy',
    workoutPlanId: 'work-3',
    dietPlanId: 'diet-3',
    lastVisitDate: '2026-07-16',
    renewalDate: '2026-09-20',
    notes: 'Vegetarian meal plans only. Monitor inhaler.',
    tags: ['Endurance', 'Vegetarian']
  }
];

// Helper to generate randomized stubs for 100-client list
function generateClientRoster(): Client[] {
  const list = [...detailedClients];
  const firstNames = ['John', 'Michael', 'James', 'Robert', 'William', 'Emily', 'Emma', 'Olivia', 'Sophia', 'Jessica', 'David', 'Daniel', 'Lucas', 'Ryan', 'Clara', 'Danny', 'Grace', 'Anna', 'Thomas', 'Ben'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];
  const genders: ('male' | 'female' | 'other')[] = ['male', 'female', 'other'];
  const goals: ('weight_loss' | 'muscle_gain' | 'endurance' | 'general_health')[] = ['weight_loss', 'muscle_gain', 'endurance', 'general_health'];
  const plans = ['basic-monthly', 'elite-quarterly', 'premium-vip-yearly'];
  const statuses: ('active' | 'inactive' | 'pending' | 'suspended')[] = ['active', 'inactive', 'pending', 'suspended'];
  const paymentStatuses: ('paid' | 'unpaid' | 'overdue')[] = ['paid', 'unpaid', 'overdue'];
  const bloodGroups: ('A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  for (let i = 4; i <= 100; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const gender = genders[i % genders.length];
    const goal = goals[i % goals.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % 10 === 0 ? 1 : i % 15 === 0 ? 3 : 0]; // Mostly active
    const payment = paymentStatuses[i % 12 === 0 ? 2 : i % 20 === 0 ? 1 : 0]; // Mostly paid
    const coachId = `coach-${(i % 10) + 1}`;
    
    list.push({
      id: `CL-${String(i).padStart(3, '0')}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone: `+1 (555) 019-${String(4000 + i)}`,
      membershipId: plan,
      status: status,
      joinDate: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
      coachId: coachId,
      profilePic: gender === 'male'
        ? `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?idx=${i}`
        : `https://images.unsplash.com/photo-1544005313-94ddf0286df2?idx=${i}`,
      attendanceRate: 50 + (i % 45),
      paymentStatus: payment,
      gender: gender,
      age: 20 + (i % 35),
      dob: `19${80 + (i % 20)}-05-15`,
      emergencyContactName: `Contact ${fName}`,
      emergencyContactPhone: `+1 (555) 019-${String(5000 + i)}`,
      bloodGroup: bloodGroups[i % bloodGroups.length],
      address: `${100 + i} Operational St, San Francisco, CA`,
      heightCm: 160 + (i % 30),
      weightKg: 50 + (i % 50),
      bmi: 18 + (i % 12),
      fitnessGoal: goal,
      renewalDate: `2026-08-${String((i % 28) + 1).padStart(2, '0')}`,
      notes: 'Calibrated member profile. Monitor attendance targets.',
      tags: [goal.toUpperCase().replace('_', ' ')]
    });
  }

  return list;
}

export const mockClients = generateClientRoster();

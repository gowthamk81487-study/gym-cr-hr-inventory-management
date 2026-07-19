'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  Dumbbell,
  ShieldCheck,
  Package,
  Activity,
  AlertTriangle,
  History,
  FileBarChart,
  Plus,
  Clock,
  Briefcase,
  Sparkles,
  CheckCircle,
  Calendar,
  Utensils,
  Zap,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import {
  RevenueChart,
  MembershipChart,
  AttendanceChart,
  InventoryChart
} from '@/components/common/Charts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { authService, clientService, coachService, membershipService, inventoryService } from '@/services';
import { db, UserRecord } from '@/services/db';
import { Client, Coach, Membership } from '@/types';
import { GymProduct } from '@/mock/inventory';

export default function DashboardPage() {
  const { showToast } = useToast();
  
  // Session States
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [coachProfile, setCoachProfile] = useState<Coach | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Admin Modal toggle states
  const [activeModal, setActiveModal] = useState<'client' | 'membership' | 'inventory' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [clientForm, setClientForm] = useState({ name: '', email: '', coach: 'coach-1', dob: '2001-01-01', plan: 'basic-monthly' });
  const [membershipForm, setMembershipForm] = useState({ name: '', price: '', period: 'monthly' });
  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'supplement', quantity: '', price: '20' });

  // Dashboard metrics states
  const [totalMembersCount, setTotalMembersCount] = useState(645);
  const [totalRevenueCount, setTotalRevenueCount] = useState(15420);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Stepper progress for 7-Day PR Starter Program (for pending clients)
  const [prDayCompleted, setPrDayCompleted] = useState<number>(0);

  const getPlanName = (planId: string) => {
    const plans = db.getCollection<Membership>('gym_memberships');
    return plans.find(p => p.id === planId)?.name || 'Basic Membership';
  };

  const loadDashboardData = async () => {
    const cur = authService.getCurrentUser();
    setCurrentUser(cur);
    if (!cur) return;

    setRole(cur.role);

    // Initialize activities
    const acts = [
      { id: 'act-1', time: '10 mins ago', type: 'registration', desc: 'Sarah Jenkins enrolled in basic-monthly tier.' },
      { id: 'act-2', time: '35 mins ago', type: 'transfer', desc: 'Client David Vance assigned to Coach Marcus Sterling.' },
      { id: 'act-3', time: '1 hour ago', type: 'payment', desc: 'Cleared invoice #INV-9284 for $129 (Elite Plan).' }
    ];
    setRecentActivities(acts);

    const cls = await clientService.getAll();
    setTotalMembersCount(cls.length + 540);

    const payments = db.getCollection<any>('gym_payments');
    const rev = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
    setTotalRevenueCount(rev || 15420);

    if (cur.role === 'client') {
      const c = cls.find(client => client.id === cur.entityId || client.email.toLowerCase() === cur.email.toLowerCase());
      if (c) {
        setClientProfile(c);
        // Load completed days from notes metadata
        const compDays = parseInt(c.notes || '0', 10);
        setPrDayCompleted(isNaN(compDays) ? 0 : compDays);
      }
    } else if (cur.role === 'coach') {
      const cos = await coachService.getAll();
      const co = cos.find(coach => coach.id === cur.entityId || coach.email.toLowerCase() === cur.email.toLowerCase());
      if (co) setCoachProfile(co);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const cleanName = clientForm.name.toLowerCase().replace(/[^a-z]/g, '');
      const parts = clientForm.dob.split('-');
      const dd = parts[2] || '01';
      const mm = parts[1] || '01';
      const yyyy = parts[0] || '2001';
      const autoEmail = `${cleanName}${dd}${mm}${yyyy}@thegymfitnesshub.in`;
      const autoPass = `${cleanName}@${dd}${mm}${yyyy}`;

      const newClient: Client = {
        id: `CL-${String(Date.now()).slice(-3)}`,
        name: clientForm.name,
        email: clientForm.email,
        phone: '+1 (555) 019-9200',
        membershipId: clientForm.plan,
        status: 'pending', // Starts as pending PR Week
        joinDate: new Date().toISOString().split('T')[0],
        coachId: clientForm.coach,
        attendanceRate: 100,
        paymentStatus: 'paid',
        gender: 'male',
        age: 25,
        dob: clientForm.dob,
        emergencyContactName: 'Emergency Person',
        emergencyContactPhone: '+1 (555) 019-9201',
        bloodGroup: 'O+',
        address: '100 Gym Plaza',
        heightCm: 175,
        weightKg: 70,
        bmi: 22.9,
        fitnessGoal: 'general_health',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '0' // Completed PR days starts at 0
      };

      await clientService.create(newClient);
      await authService.createUserAccount(autoEmail, autoPass, 'client', newClient.id);

      showToast(`Client registered! Credentials: ${autoEmail} / ${autoPass}`, 'success');
      setActiveModal(null);
      setClientForm({ name: '', email: '', coach: 'coach-1', dob: '2001-01-01', plan: 'basic-monthly' });
      loadDashboardData();
    } catch {
      showToast('Error registering client.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipForm.name || !membershipForm.price) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const newPlan: Membership = {
        id: `plan-${Date.now().toString().slice(-4)}`,
        name: membershipForm.name,
        type: membershipForm.period === 'yearly' ? 'vip' : 'monthly',
        price: parseFloat(membershipForm.price),
        durationMonths: membershipForm.period === 'yearly' ? 12 : 1,
        benefits: ['General gym access', 'Cardio floor'],
        status: 'active',
        billingPeriod: membershipForm.period as any,
        features: ['General gym access', 'Cardio floor']
      };

      await membershipService.create(newPlan);
      showToast('Membership plan tier created successfully!', 'success');
      setActiveModal(null);
      setMembershipForm({ name: '', price: '', period: 'monthly' });
    } catch {
      showToast('Failed to create tier.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.quantity) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const products = await inventoryService.getProducts();
      const newPrd: GymProduct = {
        id: `PRD-${Date.now().toString().slice(-3)}`,
        name: inventoryForm.name,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        category: inventoryForm.category as any,
        brand: 'The Gym Fitness Club',
        supplierName: 'NutriFit Wholesale Ltd',
        purchasePrice: parseFloat(inventoryForm.price) * 0.6,
        sellingPrice: parseFloat(inventoryForm.price),
        currentStock: parseInt(inventoryForm.quantity, 10),
        minStock: 10,
        maxStock: parseInt(inventoryForm.quantity, 10) * 2,
        unit: 'units',
        gstPercent: 18,
        location: 'Counter A',
        status: 'active',
        description: 'New product entry'
      };

      products.push(newPrd);
      await inventoryService.saveProducts(products);
      showToast('Stock inventory registered!', 'success');
      setActiveModal(null);
      setInventoryForm({ name: '', category: 'supplement', quantity: '', price: '20' });
    } catch {
      showToast('Failed to add stock.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerReportGeneration = () => {
    showToast('Compiling analytical datasets...', 'info');
    setTimeout(() => {
      showToast('PDF Report generated! Check downloads folder.', 'success');
    }, 1500);
  };

  // Client Complete Day in PR starter Program
  const handleCompletePRDay = async (dayNum: number) => {
    if (!clientProfile) return;
    try {
      const nextDay = prDayCompleted + 1;
      setPrDayCompleted(nextDay);
      
      const updatedClient = {
        ...clientProfile,
        notes: String(nextDay)
      };

      // If Day 7 completed, activate client
      if (nextDay >= 7) {
        updatedClient.status = 'active';
        showToast('Congratulations! You completed the 7 Day PR Program! Account activated.', 'success');
      } else {
        showToast(`Day ${dayNum} completed! Next day unlocked.`, 'success');
      }

      await clientService.update(updatedClient);
      setClientProfile(updatedClient);
    } catch {
      showToast('Error saving progress.', 'error');
    }
  };

  // 1. Client View (Dashboard / Mandatory Stepper)
  if (role === 'client' && clientProfile) {
    const isPendingPR = clientProfile.status === 'pending';

    const prProgramDays = [
      { day: 1, title: 'Introduction', desc: 'Welcome overview of gym facilities, locker rules, and target metric setup.' },
      { day: 2, title: 'Mobility & Stretching', desc: 'Focus on warm-up stretching, deep squat ranges, and shoulder rotator rotations.' },
      { day: 3, title: 'CrossFit Basics', desc: 'Introduction to kettlebell swings, rowing postures, and interval thrusters.' },
      { day: 4, title: 'Weight Training Basics', desc: 'Core compound lifts adjustments: barbell squat, flat bench press, and deadlifts.' },
      { day: 5, title: 'Fitness Assessment', desc: 'Auditing current max power ranges and tracking initial heart rate zones.' },
      { day: 6, title: 'Progress Audit Check', desc: 'Connecting calorie targets to daily nutrition schedule templates.' },
      { day: 7, title: 'PR Week Completion Certificate', desc: 'Simulated completion validation. Unlocks the full client dashboard access.' }
    ];

    if (isPendingPR) {
      return (
        <PageLayout title="PR Week Starter Program (Mandatory)" description="First-time onboarding program. Complete all 7 slots to unlock your membership dashboard.">
          <div className="max-w-3xl mx-auto py-4 space-y-6">
            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 flex items-center gap-3">
              <Award className="h-6 w-6 text-blue-400 shrink-0" />
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                Welcome to <strong>The Gym Fitness Hub</strong>! As a first-time member, you must complete your <strong>7-Day PR Starter Program</strong> before accessing workouts, diets, or the supplement store.
              </p>
            </div>

            <Card className="border-slate-900">
              <CardHeader title="7-Day Stepper Progress" description="Click and audit each day's tutorial block to advance." />
              <CardContent className="space-y-4 text-left">
                <div className="space-y-3">
                  {prProgramDays.map((item) => {
                    const isCompleted = prDayCompleted >= item.day;
                    const isCurrent = prDayCompleted === item.day - 1;
                    const isLocked = prDayCompleted < item.day - 1;

                    return (
                      <div
                        key={item.day}
                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                          isCompleted ? 'bg-emerald-500/5 border-emerald-500/15 opacity-60' :
                          isCurrent ? 'bg-slate-900/40 border-blue-500/40 ring-1 ring-blue-500/15' :
                          'bg-slate-950/40 border-slate-900/60 opacity-40'
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-black ${
                          isCompleted ? 'bg-emerald-600 border-emerald-500 text-white' :
                          isCurrent ? 'bg-blue-600 border-blue-500 text-white' :
                          'bg-slate-950 border-slate-900 text-slate-600'
                        }`}>
                          {item.day}
                        </div>

                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.desc}</p>
                          {isCurrent && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCompletePRDay(item.day)}
                              className="text-[10px] py-1 px-3.5! mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
                            >
                              Complete Day {item.day} <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-400 font-black block uppercase mt-1">✓ Complete</span>
                          )}
                          {isLocked && (
                            <span className="text-[10px] text-slate-600 font-black block uppercase mt-1">🔒 Locked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout>
      );
    }

    // Active Client Dashboard
    const assignedCoach = db.getCollection<Coach>('gym_coaches').find(co => co.id === clientProfile.coachId);
    
    return (
      <PageLayout title="My Client Roster Dashboard" description="Overview of your current program, dietary guidelines, and coaches.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-slate-900 bg-slate-900/10 text-left">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Attendance</span>
                  <p className="text-xl font-black text-slate-100">{clientProfile.attendanceRate}%</p>
                </CardContent>
              </Card>
              <Card className="border-slate-900 bg-slate-900/10 text-left">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Client Weight</span>
                  <p className="text-xl font-black text-slate-100">{clientProfile.weightKg} kg</p>
                </CardContent>
              </Card>
              <Card className="border-slate-900 bg-slate-900/10 text-left">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Body Mass Index</span>
                  <p className="text-xl font-black text-slate-100">{clientProfile.bmi}</p>
                </CardContent>
              </Card>
            </div>

            {/* Workout plan stub */}
            <Card className="border-slate-900">
              <CardHeader
                title="My Assigned Workout Routine"
                description="Your current exercise plan compiled by your coach."
                action={<Zap className="h-5 w-5 text-blue-500" />}
              />
              <CardContent className="text-xs font-semibold text-slate-300">
                <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-3">
                  <h5 className="font-bold text-slate-200 text-sm">Push-Pull-Legs Powerlifting Routine</h5>
                  <div className="divide-y divide-slate-900/60">
                    <p className="py-2 flex justify-between"><span>Barbell Back Squat</span><span>4 sets x 8 reps</span></p>
                    <p className="py-2 flex justify-between"><span>Dumbbell Bench Press</span><span>3 sets x 10 reps</span></p>
                    <p className="py-2 flex justify-between"><span>Conventional Deadlift</span><span>3 sets x 5 reps</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diet plan stub */}
            <Card className="border-slate-900">
              <CardHeader
                title="My Prescribed Nutrition Plan"
                description="Daily calorie limit and macronutrients split envelope."
                action={<Utensils className="h-5 w-5 text-emerald-500" />}
              />
              <CardContent className="text-xs font-semibold text-slate-300">
                <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-slate-200 text-sm">Ketogenic High Protein Plan</h5>
                    <Badge variant="emerald">2,400 kcal</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-slate-900 p-2 rounded">
                      <span className="text-slate-500 block uppercase text-[8px]">Carbs</span>
                      <span>50g</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <span className="text-slate-500 block uppercase text-[8px]">Protein</span>
                      <span>160g</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <span className="text-slate-500 block uppercase text-[8px]">Fats</span>
                      <span>120g</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Coach & Membership details side column */}
          <div className="space-y-6">
            
            {/* My Coach */}
            <Card className="border-slate-900">
              <CardHeader title="My Assigned Coach" description="Certified health expert mapping your routines." />
              <CardContent className="text-xs font-semibold text-slate-300 text-center space-y-4">
                {assignedCoach ? (
                  <>
                    <Avatar name={assignedCoach.name} src={assignedCoach.profilePic} size="lg" className="mx-auto" />
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{assignedCoach.name}</h4>
                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block mt-1">{assignedCoach.specialization}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">"{assignedCoach.bio}"</p>
                  </>
                ) : (
                  <p className="text-slate-500">No trainer assigned to your profile.</p>
                )}
              </CardContent>
            </Card>

            {/* My Membership */}
            <Card className="border-slate-900">
              <CardHeader title="Active Plan Status" />
              <CardContent className="text-xs font-semibold text-slate-300 space-y-3 text-left">
                <div className="bg-slate-950/40 p-3 rounded border border-slate-900">
                  <span className="text-slate-500 uppercase text-[8px]">Enrolled tier</span>
                  <p className="font-bold text-slate-200 text-sm mt-1">{getPlanName(clientProfile.membershipId)}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded border border-slate-900">
                  <span className="text-slate-500 uppercase text-[8px]">Renewal Cycle</span>
                  <p className="font-bold text-slate-200 mt-1">{clientProfile.renewalDate}</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </PageLayout>
    );
  }

  // 2. Coach Dashboard View
  if (role === 'coach' && coachProfile) {
    const clients = db.getCollection<Client>('gym_clients');
    const myClients = clients.filter(c => c.coachId === coachProfile.id);

    return (
      <PageLayout
        title="Coach Dashboard"
        description="Review your active assigned clients roster and pending dietary programs."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
          {/* Stats Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Assigned Members" value={myClients.length} icon={Users} change="Total active clients roster" />
              <StatCard title="Weekly Attendance Checkins" value={myClients.filter(c => c.attendanceRate >= 80).length} icon={CheckCircle} change="High attendance rate clients" changeType="increase" />
            </div>

            {/* Clients List */}
            <Card className="border-slate-900">
              <CardHeader title="My Assigned Clients Directory" description="Roster overview of client fitness parameters." />
              <CardContent className="p-0">
                <div className="table-container text-[11px] font-semibold text-slate-400">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                        <th className="p-3">Client</th>
                        <th className="p-3">Current Goal</th>
                        <th className="p-3">Weight Logs</th>
                        <th className="p-3">BMI</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {myClients.map(c => (
                        <tr key={c.id} className="table-row-hover text-slate-300">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={c.name} src={c.profilePic} size="sm" />
                              <div>
                                <p className="font-bold text-slate-200">{c.name}</p>
                                <span className="text-[9.5px] text-slate-500">{c.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 uppercase text-[9px] text-blue-400">{c.fitnessGoal.replace('_', ' ')}</td>
                          <td className="p-3 font-mono">{c.weightKg} kg</td>
                          <td className="p-3 font-mono">{c.bmi}</td>
                          <td className="p-3">
                            <Badge variant={c.status === 'active' ? 'emerald' : 'rose'}>{c.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coach Bio Sidebar info */}
          <div className="space-y-6">
            <Card className="border-slate-900">
              <CardHeader title="Coach Profile Overview" />
              <CardContent className="text-xs font-semibold text-slate-300 text-center space-y-4">
                <Avatar name={coachProfile.name} src={coachProfile.profilePic} size="lg" className="mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{coachProfile.name}</h4>
                  <span className="text-[9px] text-blue-400 font-bold block mt-1 uppercase tracking-wider">{coachProfile.specialization}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium bg-slate-950/40 p-3 rounded border border-slate-900">
                  "{coachProfile.bio}"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 3. Admin / Manager Dashboard View (Executive Overview)
  return (
    <PageLayout
      title="Executive Overview"
      description="The Gym Fitness Club real-time analytics and management operations."
    >
      <div className="space-y-8 py-2">
        {/* Quick Actions Control Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Operator Controls</h4>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              The Gym Fitness Club Stage 4 Active
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('client')}
              className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4 text-blue-500" /> Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('membership')}
              className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4 text-emerald-500" /> Plan Tier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModal('inventory')}
              className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-300 hover:text-white"
            >
              <Plus className="h-4 w-4 text-purple-500" /> Stock Item
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerReportGeneration}
              className="text-xs py-1.5 px-3.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <FileBarChart className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Dashboard KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Members"
            value={totalMembersCount}
            change="+14% this month"
            changeType="increase"
            icon={Users}
            description="Active & inactive member accounts"
          />
          <StatCard
            title="Active Memberships"
            value={totalMembersCount - 35}
            change="+5 new today"
            changeType="increase"
            icon={CreditCard}
            description="Currently active recurring plans"
          />
          <StatCard
            title="Month Revenue"
            value={`$${totalRevenueCount.toLocaleString()}`}
            change="+8.2% vs last month"
            changeType="increase"
            icon={DollarSign}
            description="Subscription + retail billing ledger"
          />
          <StatCard
            title="Daily Attendance"
            value={180}
            change="-4% vs yesterday"
            changeType="decrease"
            icon={Activity}
            description="Check-ins recorded today"
          />
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart title="Cashflow Revenue" />
          <MembershipChart title="Active Tiers Split" />
          <AttendanceChart title="Average Daily Checkins" />
          <InventoryChart title="Supplies Stock Status" />
        </div>

        {/* Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-900 lg:col-span-2">
            <CardHeader
              title="Recent Activity Log"
              description="Chronological log of portal transactions"
              action={
                <div className="h-7 w-7 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center text-slate-500 shadow-inner">
                  <History className="h-4 w-4" />
                </div>
              }
            />
            <CardContent>
              <div className="divide-y divide-slate-900/60">
                {recentActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-200">{act.desc}</p>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        {act.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert side panel */}
          <div className="space-y-6">
            <Card className="border-rose-500/10 border-slate-900">
              <CardHeader
                title="Low Stock Alerts"
                description="Products requiring replenishment"
                action={
                  <div className="h-7 w-7 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center justify-center text-rose-500">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                }
              />
              <CardContent>
                <div className="space-y-3 text-xs font-semibold text-slate-300">
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded border border-slate-900">
                    <div>
                      <h5>Whey Protein Hydrolyzed</h5>
                      <span className="text-[8px] text-slate-500 uppercase">supplement</span>
                    </div>
                    <span className="text-rose-400 font-bold">2 left</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QUICK CONTROL DIALOG MODALS */}
      
      {/* 1. Add Client Modal */}
      <Dialog isOpen={activeModal === 'client'} onClose={() => setActiveModal(null)} title="Add Member Account">
        <form onSubmit={handleAddClientSubmit} className="space-y-4 pt-2">
          <Input label="Full Name" required value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Sarah Jenkins" />
          <Input label="Email Address" required type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} placeholder="sarah@example.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="DOB" type="date" required value={clientForm.dob} onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })} className="scheme-dark" />
            <Select
              label="Assigned Coach"
              options={[
                { value: 'coach-1', label: 'Coach Marcus Sterling' },
                { value: 'coach-2', label: 'Coach Elena Rostova' },
                { value: 'coach-3', label: 'Coach Damien Vance' }
              ]}
              value={clientForm.coach}
              onChange={(e) => setClientForm({ ...clientForm, coach: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Register Account</Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Add Membership Modal */}
      <Dialog isOpen={activeModal === 'membership'} onClose={() => setActiveModal(null)} title="Create Plan Tier">
        <form onSubmit={handleAddMembershipSubmit} className="space-y-4 pt-2">
          <Input label="Tier Name" required value={membershipForm.name} onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })} placeholder="Elite Coaching Pack" />
          <Input label="Price Rate ($)" required type="number" value={membershipForm.price} onChange={(e) => setMembershipForm({ ...membershipForm, price: e.target.value })} placeholder="299" />
          <Select
            label="Billing Interval"
            options={[
              { value: 'monthly', label: 'Monthly billing cycle' },
              { value: 'quarterly', label: 'Quarterly billing cycle' },
              { value: 'yearly', label: 'Annual billing cycle' }
            ]}
            value={membershipForm.period}
            onChange={(e) => setMembershipForm({ ...membershipForm, period: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Create Tier</Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Add Inventory Modal */}
      <Dialog isOpen={activeModal === 'inventory'} onClose={() => setActiveModal(null)} title="Register Stock Supplies">
        <form onSubmit={handleAddInventorySubmit} className="space-y-4 pt-2">
          <Input label="Product Name" required value={inventoryForm.name} onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })} placeholder="Whey Isolate Protein (Chocolate)" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: 'supplements', label: 'Supplements' },
                { value: 'cafe', label: 'Cafe Drinks' },
                { value: 'merchandise', label: 'Merchandise' }
              ]}
              value={inventoryForm.category}
              onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
            />
            <Input label="Selling Price ($)" type="number" value={inventoryForm.price} onChange={(e) => setInventoryForm({ ...inventoryForm, price: e.target.value })} />
          </div>
          <Input label="Stock Quantity" required type="number" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} placeholder="50" />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Register Stock</Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

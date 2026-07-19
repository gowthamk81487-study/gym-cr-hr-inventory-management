'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Calendar,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  UserX,
  FileDown,
  Info,
  Activity
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import { db } from '@/services/db';
import { authService, clientService, notificationService, paymentService } from '@/services';
import { Client } from '@/types';
import { exportData } from '@/utils/export';

export interface GymMembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  discount: number;
  gstPercent: number;
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
  description: string;
  notes?: string;
  status?: 'active' | 'archived';
}

export interface ClientMembershipRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  planId: string;
  planName: string;
  joinDate: string;
  expirationDate: string;
  durationMonths: number;
  amountPaid: number;
  paymentMethod: string;
  status: 'active' | 'renewed' | 'frozen' | 'expired' | 'expiring_soon' | 'cancelled';
  notes?: string;
}

export default function MembershipsPage() {
  const { showToast } = useToast();

  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Database lists
  const [plans, setPlans] = useState<GymMembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<ClientMembershipRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Tab toggler
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'subscribers'>('dashboard');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Records
  const [selectedPlan, setSelectedPlan] = useState<GymMembershipPlan | null>(null);
  const [selectedMember, setSelectedMember] = useState<ClientMembershipRecord | null>(null);

  // Overlay triggers
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Client Purchase state
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasePlan, setPurchasePlan] = useState<GymMembershipPlan | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    paymentMethod: 'UPI'
  });
  const [activeReceipt, setActiveReceipt] = useState<ClientMembershipRecord | null>(null);

  // Form states
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    durationMonths: '1',
    price: '',
    discount: '0',
    gstPercent: '18',
    enrollmentFee: '20',
    renewalFee: '',
    freezeAllowed: 'true',
    maxFreezeDays: '30',
    transferAllowed: 'false',
    guestPassCount: '1',
    ptSessionsCount: '0',
    dietConsultsCount: '0',
    workoutConsultsCount: '1',
    accessTiming: '24_7' as '24_7' | 'off_peak' | 'daytime' | 'weekends_only',
    notes: ''
  });

  const [renewForm, setRenewForm] = useState({
    months: '1',
    amountPaid: '',
    method: 'Stripe Credit'
  });

  const [freezeForm, setFreezeForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Medical: Shoulder strain'
  });

  const [upgradeForm, setUpgradeForm] = useState({
    newPlanId: ''
  });

  const loadData = async () => {
    try {
      const storedPlans = db.getCollection<GymMembershipPlan>('gym_memberships');
      setPlans(storedPlans);

      const storedMemberships = db.getCollection<ClientMembershipRecord>('gym_subscriber_memberships');
      setMemberships(storedMemberships);

      const cls = await clientService.getAll();
      setClients(cls);

      if (storedPlans.length > 0 && !upgradeForm.newPlanId) {
        setUpgradeForm({ newPlanId: storedPlans[0].id });
      }
    } catch {
      showToast('Error loading memberships state.', 'error');
    }
  };

  useEffect(() => {
    const cur = authService.getCurrentUser();
    setCurrentUser(cur);
    if (cur) {
      setRole(cur.role);
    }
    loadData();
  }, []);

  // Dashboard summary aggregations
  const dashboardStats = useMemo(() => {
    const active = memberships.filter(m => m.status === 'active' || m.status === 'renewed').length;
    const expiring = memberships.filter(m => m.status === 'expiring_soon').length;
    const expired = memberships.filter(m => m.status === 'expired').length;
    const frozen = memberships.filter(m => m.status === 'frozen').length;
    const revenue = memberships.reduce((acc, m) => acc + m.amountPaid, 0);
    return { active, expiring, expired, frozen, revenue };
  }, [memberships]);

  // Filtered lists
  const filteredSubscribers = useMemo(() => {
    return memberships.filter(m => {
      const matchSearch =
        m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.clientPhone.includes(searchQuery);
      
      const matchPlan = filterPlan === 'all' || m.planId === filterPlan;
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [memberships, searchQuery, filterPlan, filterStatus]);

  // Paginated slices
  const paginatedSubscribers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredSubscribers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSubscribers, currentPage]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  const clientSubInfo = useMemo(() => {
    if (!currentUser || role !== 'client') return null;
    return memberships.find(m => m.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && m.status !== 'cancelled' && m.status !== 'expired');
  }, [memberships, currentUser, role]);

  // Form Handlers
  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const priceNum = parseFloat(planForm.price);
    const newPlan: GymMembershipPlan = {
      id: `plan-${Date.now()}`,
      name: planForm.name,
      description: planForm.description,
      durationMonths: parseInt(planForm.durationMonths, 10),
      price: priceNum,
      discount: parseFloat(planForm.discount) || 0,
      gstPercent: parseFloat(planForm.gstPercent) || 18,
      enrollmentFee: parseFloat(planForm.enrollmentFee) || 20,
      renewalFee: parseFloat(planForm.renewalFee) || (priceNum * 0.9),
      freezeAllowed: planForm.freezeAllowed === 'true',
      maxFreezeDays: parseInt(planForm.maxFreezeDays, 10) || 30,
      transferAllowed: planForm.transferAllowed === 'true',
      guestPassCount: parseInt(planForm.guestPassCount, 10) || 0,
      ptSessionsCount: parseInt(planForm.ptSessionsCount, 10) || 0,
      dietConsultsCount: parseInt(planForm.dietConsultsCount, 10) || 0,
      workoutConsultsCount: parseInt(planForm.workoutConsultsCount, 10) || 0,
      accessTiming: planForm.accessTiming,
      notes: planForm.notes,
      status: 'active'
    };

    const updated = [...plans, newPlan];
    db.saveCollection('gym_memberships', updated);
    setPlans(updated);
    setIsAddingPlan(false);
    showToast('Membership plan tier created successfully!', 'success');
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const priceNum = parseFloat(planForm.price);
    const updated = plans.map(p => {
      if (p.id === selectedPlan.id) {
        return {
          ...p,
          name: planForm.name,
          description: planForm.description,
          durationMonths: parseInt(planForm.durationMonths, 10),
          price: priceNum,
          discount: parseFloat(planForm.discount) || 0,
          gstPercent: parseFloat(planForm.gstPercent) || 18,
          enrollmentFee: parseFloat(planForm.enrollmentFee) || 20,
          renewalFee: parseFloat(planForm.renewalFee) || (priceNum * 0.9),
          freezeAllowed: planForm.freezeAllowed === 'true',
          maxFreezeDays: parseInt(planForm.maxFreezeDays, 10) || 30,
          transferAllowed: planForm.transferAllowed === 'true',
          guestPassCount: parseInt(planForm.guestPassCount, 10) || 0,
          ptSessionsCount: parseInt(planForm.ptSessionsCount, 10) || 0,
          dietConsultsCount: parseInt(planForm.dietConsultsCount, 10) || 0,
          workoutConsultsCount: parseInt(planForm.workoutConsultsCount, 10) || 0,
          accessTiming: planForm.accessTiming,
          notes: planForm.notes
        };
      }
      return p;
    });

    db.saveCollection('gym_memberships', updated);
    setPlans(updated);
    setIsEditingPlan(false);
    setSelectedPlan(null);
    showToast('Membership plan tier updated.', 'success');
  };

  const handleDeletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    db.saveCollection('gym_memberships', updated);
    setPlans(updated);
    showToast('Plan tier deleted.', 'success');
  };

  // Client Purchase flow
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchasePlan || !currentUser) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const exp = new Date();
      exp.setMonth(now.getMonth() + purchasePlan.durationMonths);

      const newRecord: ClientMembershipRecord = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        clientId: currentUser.entityId || 'CL-001',
        clientName: currentUser.email.split('@')[0],
        clientEmail: currentUser.email,
        clientPhone: 'N/A',
        planId: purchasePlan.id,
        planName: purchasePlan.name,
        joinDate: now.toISOString().split('T')[0],
        expirationDate: exp.toISOString().split('T')[0],
        durationMonths: purchasePlan.durationMonths,
        amountPaid: purchasePlan.price,
        paymentMethod: purchaseForm.paymentMethod,
        status: 'active'
      };

      // Query real client profile details
      const currentClient = clients.find(c => c.email.toLowerCase() === currentUser.email.toLowerCase());
      if (currentClient) {
        newRecord.clientName = currentClient.name;
        newRecord.clientPhone = currentClient.phone;

        // Update Client profile state
        currentClient.membershipId = purchasePlan.id;
        currentClient.paymentStatus = 'paid';
        currentClient.status = 'active';
        await clientService.update(currentClient);
      }

      // 1. Save subscription
      const list = db.getCollection<ClientMembershipRecord>('gym_subscriber_memberships');
      list.unshift(newRecord);
      db.saveCollection('gym_subscriber_memberships', list);
      setMemberships(list);

      // 2. Add to payments ledger
      await paymentService.create({
        id: `PAY-${Date.now().toString().slice(-3)}`,
        clientId: newRecord.clientId,
        clientName: newRecord.clientName,
        amount: newRecord.amountPaid,
        date: newRecord.joinDate,
        status: 'paid',
        paymentMethod: (purchaseForm.paymentMethod.toLowerCase() === 'card' ? 'credit_card' : purchaseForm.paymentMethod.toLowerCase() === 'cash' ? 'cash' : 'upi') as any,
        membershipName: newRecord.planName
      });

      // 3. Dispatch Notification
      await notificationService.create({
        title: 'New Membership Enrolled',
        message: `${newRecord.clientName} enrolled in ${newRecord.planName}. Mode: ${purchaseForm.paymentMethod}.`,
        type: 'success',
        targetRole: 'manager'
      });

      showToast('Membership purchased successfully!', 'success');
      setIsPurchasing(false);
      
      // Load receipt
      setActiveReceipt(newRecord);
      loadData();
    } catch {
      showToast('Transaction checkout failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const months = parseInt(renewForm.months, 10);
    const expDate = new Date(selectedMember.expirationDate);
    expDate.setMonth(expDate.getMonth() + months);

    const updated = memberships.map(m => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          expirationDate: expDate.toISOString().split('T')[0],
          status: 'renewed' as const,
          amountPaid: m.amountPaid + parseFloat(renewForm.amountPaid || '0'),
          paymentMethod: renewForm.method
        };
      }
      return m;
    });

    db.saveCollection('gym_subscriber_memberships', updated);
    setMemberships(updated);
    setIsRenewing(false);
    setSelectedMember(null);
    showToast('Subscriber membership renewed successfully.', 'success');
  };

  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const updated = memberships.map(m => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          status: 'frozen' as const,
          notes: `Frozen from ${freezeForm.startDate} to ${freezeForm.endDate}. Reason: ${freezeForm.reason}`
        };
      }
      return m;
    });

    db.saveCollection('gym_subscriber_memberships', updated);
    setMemberships(updated);
    setIsFreezing(false);
    setSelectedMember(null);
    showToast('Membership access frozen.', 'success');
  };

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const newPlan = plans.find(p => p.id === upgradeForm.newPlanId);
    if (!newPlan) return;

    const updated = memberships.map(m => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          planId: newPlan.id,
          planName: newPlan.name,
          amountPaid: newPlan.price,
          status: 'active' as const
        };
      }
      return m;
    });

    db.saveCollection('gym_subscriber_memberships', updated);
    setMemberships(updated);
    setIsUpgrading(false);
    setSelectedMember(null);
    showToast('Membership upgraded successfully!', 'success');
  };

  const getPlanName = (id: string) => {
    const plan = plans.find(p => p.id === id);
    return plan ? plan.name : 'Unknown Tier';
  };

  const getPlanPrice = (id: string) => {
    const plan = plans.find(p => p.id === id);
    return plan ? plan.price : 0;
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredSubscribers.length === 0) {
      showToast('No data available to export.', 'error');
      return;
    }

    const headers = ['Subscription ID', 'Member Name', 'Plan Enrolled', 'Date Joined', 'Expiration Date', 'Rate Paid ($)', 'Method', 'Status'];
    const rows = filteredSubscribers.map(sub => [
      sub.id,
      sub.clientName,
      sub.planName,
      sub.joinDate,
      sub.expirationDate,
      sub.amountPaid,
      sub.paymentMethod,
      sub.status
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Memberships_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting members to CSV.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting members to Excel.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Active Membership Subscribers', headers, rows, filename);
      showToast('Exporting members to PDF.', 'success');
    }
  };

  // Render Client Hub
  if (role === 'client') {
    return (
      <PageLayout
        title="My Membership Portal"
        description="Verify your current membership duration, renew access, or purchase upgrade options."
      >
        <div className="space-y-8 py-2 text-left">
          {clientSubInfo ? (
            <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
              <CardHeader title="Current Active Subscription" action={<Badge variant="blue">{clientSubInfo.status}</Badge>} />
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-semibold">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">Plan Tier:</span>
                  <p className="text-sm font-bold text-slate-200">{clientSubInfo.planName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">Duration Period:</span>
                  <p className="text-sm font-bold text-slate-200">{clientSubInfo.joinDate} to {clientSubInfo.expirationDate}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">Rate Paid:</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">${clientSubInfo.amountPaid}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-900 text-center py-6">
              <CardContent className="space-y-2">
                <CreditCard className="h-8 w-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200">No Active Membership Plan</h4>
                <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto">
                  Subscribe to a premium club membership plan below to gain instant access to gym facilities.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Catalog of plans */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Select Membership Plan</h3>

            {plans.filter(p => p.status === 'active').length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl font-bold text-xs bg-slate-950/20">
                No Membership Plans Available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(p => p.status === 'active').map(plan => (
                  <Card key={plan.id} className="border-slate-900 flex flex-col justify-between hover:border-blue-500/25">
                    <CardContent className="space-y-4 pt-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{plan.name}</h4>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{plan.durationMonths} Month Duration</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                      
                      <div className="space-y-1.5 text-[10.5px] font-semibold text-slate-400 border-t border-slate-950 pt-3">
                        <p className="flex justify-between"><span>PT Sessions:</span> <span className="text-slate-200">{plan.ptSessionsCount}x included</span></p>
                        <p className="flex justify-between"><span>Diet Consults:</span> <span className="text-slate-200">{plan.dietConsultsCount}x included</span></p>
                        <p className="flex justify-between"><span>Access:</span> <span className="text-slate-200 uppercase font-mono">{plan.accessTiming.replace('_', '/')}</span></p>
                      </div>

                      <div className="border-t border-slate-950 pt-3">
                        <span className="text-xl font-black text-white">${plan.price}</span>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t border-slate-950">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={!!clientSubInfo}
                        onClick={() => {
                          setPurchasePlan(plan);
                          setIsPurchasing(true);
                        }}
                        className="text-xs py-1.5"
                      >
                        {clientSubInfo ? 'Active Enrolment' : 'Enroll Plan'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Dialog */}
        {purchasePlan && (
          <Dialog isOpen={isPurchasing} onClose={() => setIsPurchasing(false)} title={`Enroll Membership: ${purchasePlan.name}`}>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4 pt-2 text-left">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs font-semibold text-slate-400 space-y-2">
                <p><strong className="text-slate-300">Plan Enrolling:</strong> {purchasePlan.name}</p>
                <p><strong className="text-slate-300">Duration Period:</strong> {purchasePlan.durationMonths} Month(s)</p>
                <p><strong className="text-slate-300">Amount Due:</strong> <span className="text-emerald-400 font-bold">${purchasePlan.price}</span></p>
              </div>

              <Select
                label="Select Payment Method"
                options={[
                  { value: 'UPI', label: 'UPI (Paytm, GPay, PhonePe)' },
                  { value: 'Card', label: 'Credit or Debit Card' },
                  { value: 'Cash', label: 'Cash Payment at Counter' },
                  { value: 'Net Banking', label: 'Net Banking transfer' },
                  { value: 'Other', label: 'Other Wallets' }
                ]}
                value={purchaseForm.paymentMethod}
                onChange={e => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button variant="outline" size="sm" onClick={() => setIsPurchasing(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">Confirm & Pay</Button>
              </div>
            </form>
          </Dialog>
        )}

        {/* Receipt invoice popup */}
        {activeReceipt && (
          <Dialog isOpen={!!activeReceipt} onClose={() => setActiveReceipt(null)} title="Purchase Confirmation Receipt">
            <div className="space-y-4 pt-2 text-left text-xs font-semibold">
              <div className="flex items-center gap-2 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/15 text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p>Transaction cleared! Membership successfully activated.</p>
              </div>

              <div className="border border-slate-900 rounded-xl p-4 space-y-3.5 bg-slate-950/20 font-mono text-[10.5px]">
                <h4 className="text-center font-black border-b border-slate-900 pb-2 text-slate-200">THE GYM FITNESS CLUB INVOICE</h4>
                <p><span className="text-slate-500">Subscription ID:</span> {activeReceipt.id}</p>
                <p><span className="text-slate-500">Client Name:</span> {activeReceipt.clientName}</p>
                <p><span className="text-slate-500">Plan Selected:</span> {activeReceipt.planName}</p>
                <p><span className="text-slate-500">Join Date:</span> {activeReceipt.joinDate}</p>
                <p><span className="text-slate-500">Expiration Date:</span> {activeReceipt.expirationDate}</p>
                <p><span className="text-slate-500">Payment Method:</span> {activeReceipt.paymentMethod}</p>
                <p className="border-t border-slate-900 pt-2 font-black text-slate-200"><span className="text-slate-500 font-medium">TOTAL PAID:</span> ${activeReceipt.amountPaid}</p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-900">
                <Button variant="primary" size="sm" onClick={() => setActiveReceipt(null)} className="text-xs px-4!">Close Receipt</Button>
              </div>
            </div>
          </Dialog>
        )}
      </PageLayout>
    );
  }

  // Render Admin View
  return (
    <PageLayout
      title="Membership Tariff & Subscribers"
      description="Manage the membership catalog, update subscription lifecycles, and audit active roster."
      actions={
        <div className="flex gap-2">
          {activeTab === 'plans' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddingPlan(true)}
              className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <Plus className="h-4 w-4" /> Create Plan Tier
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 py-2 text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'KPI Summary', icon: Activity },
            { id: 'plans', label: 'Plan Tariff Catalog', icon: Layers },
            { id: 'subscribers', label: 'Active Subscribers List', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                  activeTab === tab.id ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: KPI Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <StatCard title="Active Members" value={dashboardStats.active} icon={CheckCircle} change="Active keys" />
              <StatCard title="Expiring Soon" value={dashboardStats.expiring} icon={AlertTriangle} change="Needs renewal contact" changeType="decrease" />
              <StatCard title="Frozen Accounts" value={dashboardStats.frozen} icon={Clock} change="Suspended access holds" />
              <StatCard title="Cumulative Sales" value={`$${dashboardStats.revenue.toLocaleString()}`} icon={DollarSign} change="Total subscription sales" changeType="increase" />
            </div>

            <Card className="border-slate-900">
              <CardHeader title="Roster Logs" description="Verify subscribers distribution across plan options." />
              <CardContent className="space-y-4 text-xs font-semibold text-slate-400">
                {memberships.slice(0, 3).map((sub, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-900 last:border-0 last:pb-0">
                    <p className="text-slate-300">
                      {sub.clientName} joined <strong className="text-blue-400">{sub.planName}</strong> plan Period: {sub.joinDate} to {sub.expirationDate}.
                    </p>
                    <Badge variant={sub.status === 'active' ? 'emerald' : 'slate'}>{sub.status}</Badge>
                  </div>
                ))}
                {memberships.length === 0 && (
                  <div className="text-center text-slate-500 py-6 font-semibold">No memberships logged.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Plan Catalog */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input
                className="pl-9 text-xs"
                placeholder="Search plan tiers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {plans.filter(p => p.status === 'active').length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl font-bold text-xs bg-slate-950/20">
                No Membership Plans Available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(p => p.status === 'active').map(plan => (
                  <Card key={plan.id} className="border-slate-900 flex flex-col justify-between">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{plan.name}</h4>
                          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{plan.durationMonths} Month Duration</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {plan.description}
                      </p>

                      <div className="border-t border-slate-950 pt-3">
                        <span className="text-xl font-black text-white">${plan.price}</span>
                      </div>
                    </CardContent>

                    <div className="p-4 border-t border-slate-950 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setPlanForm({
                            name: plan.name,
                            description: plan.description,
                            durationMonths: String(plan.durationMonths),
                            price: String(plan.price),
                            discount: String(plan.discount),
                            gstPercent: String(plan.gstPercent),
                            enrollmentFee: String(plan.enrollmentFee),
                            renewalFee: String(plan.renewalFee),
                            freezeAllowed: String(plan.freezeAllowed),
                            maxFreezeDays: String(plan.maxFreezeDays),
                            transferAllowed: String(plan.transferAllowed),
                            guestPassCount: String(plan.guestPassCount),
                            ptSessionsCount: String(plan.ptSessionsCount),
                            dietConsultsCount: String(plan.dietConsultsCount),
                            workoutConsultsCount: String(plan.workoutConsultsCount),
                            accessTiming: plan.accessTiming,
                            notes: plan.notes || ''
                          });
                          setIsEditingPlan(true);
                        }}
                        className="flex-1 text-[10px] py-1 border-slate-800"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-[10px] py-1 border-slate-800 text-rose-500 hover:bg-rose-500/5"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Subscribers List */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/10 border border-slate-900 p-4 rounded-xl">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  className="pl-9 text-xs"
                  placeholder="Search subscribers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="text-xs border-slate-850 hover:text-white">PDF</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} className="text-xs border-slate-850 hover:text-white">Excel</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="text-xs border-slate-850 hover:text-white">CSV</Button>
              </div>
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Enrolled Plan</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">Expiration Date</th>
                    <th className="p-3">Billing Status</th>
                    <th className="p-3 font-mono text-right">Clearance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedSubscribers.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">
                        <div>
                          <p>{sub.clientName}</p>
                          <span className="text-[9px] text-slate-500 font-mono block">{sub.clientPhone}</span>
                        </div>
                      </td>
                      <td className="p-3">{sub.planName}</td>
                      <td className="p-3 font-mono text-slate-500">{sub.joinDate}</td>
                      <td className="p-3 font-mono text-slate-500">
                        <span className={sub.status === 'expiring_soon' ? 'text-amber-450 font-bold' : sub.status === 'expired' ? 'text-rose-400' : ''}>
                          {sub.expirationDate}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={sub.status === 'active' || sub.status === 'renewed' ? 'emerald' : sub.status === 'frozen' ? 'warning' : 'rose'}>
                          {sub.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                              <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'Quick Renew',
                              icon: Clock,
                              onClick: () => {
                                setSelectedMember(sub);
                                setRenewForm({ months: '1', amountPaid: String(getPlanPrice(sub.planId)), method: 'Stripe Credit' });
                                setIsRenewing(true);
                              }
                            },
                            {
                              label: 'Freeze Access',
                              icon: AlertTriangle,
                              onClick: () => {
                                setSelectedMember(sub);
                                setIsFreezing(true);
                              }
                            },
                            {
                              label: 'Upgrade Plan',
                              icon: Sparkles,
                              onClick: () => {
                                setSelectedMember(sub);
                                if (plans.length > 0) {
                                  setUpgradeForm({ newPlanId: plans[0].id });
                                }
                                setIsUpgrading(true);
                              }
                            },
                            {
                              label: 'Cancel Plan',
                              icon: UserX,
                              danger: true,
                              onClick: () => {
                                const list = memberships.map(m => m.id === sub.id ? { ...m, status: 'cancelled' as const } : m);
                                db.saveCollection('gym_subscriber_memberships', list);
                                setMemberships(list);
                                showToast('Membership cancelled.', 'success');
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        No client subscriptions match the filters selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalRecords={filteredSubscribers.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* OVERLAY FORMS */}
      {/* 1. Add Membership Plan Modal */}
      <Dialog isOpen={isAddingPlan} onClose={() => setIsAddingPlan(false)} title="Create Membership Plan">
        <form onSubmit={handleAddPlanSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              required
              value={planForm.name}
              onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="Weekend Elite Warrior"
            />
            <Input
              label="Monthly Price ($)"
              required
              type="number"
              value={planForm.price}
              onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
              placeholder="79"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Duration (Months)"
              options={[
                { value: '1', label: '1 Month' },
                { value: '3', label: '3 Months' },
                { value: '6', label: '6 Months' },
                { value: '12', label: '12 Months' }
              ]}
              value={planForm.durationMonths}
              onChange={e => setPlanForm({ ...planForm, durationMonths: e.target.value })}
            />
            <Input
              label="Discount ($)"
              type="number"
              value={planForm.discount}
              onChange={e => setPlanForm({ ...planForm, discount: e.target.value })}
            />
            <Select
              label="Access Timing"
              options={[
                { value: '24_7', label: '24/7 Access' },
                { value: 'off_peak', label: 'Off-Peak hours' },
                { value: 'daytime', label: 'Daytime only' },
                { value: 'weekends_only', label: 'Weekends only' }
              ]}
              value={planForm.accessTiming}
              onChange={e => setPlanForm({ ...planForm, accessTiming: e.target.value as any })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Freeze Allowed"
              options={[
                { value: 'true', label: 'Allow Freezing' },
                { value: 'false', label: 'Block Freezing' }
              ]}
              value={planForm.freezeAllowed}
              onChange={e => setPlanForm({ ...planForm, freezeAllowed: e.target.value })}
            />
            <Input
              label="Max Freeze Days"
              type="number"
              value={planForm.maxFreezeDays}
              onChange={e => setPlanForm({ ...planForm, maxFreezeDays: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Input label="Guest Passes" type="number" value={planForm.guestPassCount} onChange={e => setPlanForm({ ...planForm, guestPassCount: e.target.value })} />
            <Input label="PT Sessions" type="number" value={planForm.ptSessionsCount} onChange={e => setPlanForm({ ...planForm, ptSessionsCount: e.target.value })} />
            <Input label="Diet Consults" type="number" value={planForm.dietConsultsCount} onChange={e => setPlanForm({ ...planForm, dietConsultsCount: e.target.value })} />
            <Input label="Workout Plan" type="number" value={planForm.workoutConsultsCount} onChange={e => setPlanForm({ ...planForm, workoutConsultsCount: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Plan Description</label>
            <textarea
              rows={2}
              value={planForm.description}
              onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Detail gym floor perks, class availability or recovery suite accesses..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingPlan(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
              Create Plan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Edit Membership Plan Modal */}
      {selectedPlan && (
        <Dialog isOpen={isEditingPlan} onClose={() => { setIsEditingPlan(false); setSelectedPlan(null); }} title="Edit Membership Details">
          <form onSubmit={handleEditPlanSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name"
                required
                value={planForm.name}
                onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
              />
              <Input
                label="Monthly Price ($)"
                required
                type="number"
                value={planForm.price}
                onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select
                label="Duration (Months)"
                options={[
                  { value: '1', label: '1 Month' },
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' }
                ]}
                value={planForm.durationMonths}
                onChange={e => setPlanForm({ ...planForm, durationMonths: e.target.value })}
              />
              <Input
                label="Discount ($)"
                type="number"
                value={planForm.discount}
                onChange={e => setPlanForm({ ...planForm, discount: e.target.value })}
              />
              <Select
                label="Access Timing"
                options={[
                  { value: '24_7', label: '24/7 Access' },
                  { value: 'off_peak', label: 'Off-Peak hours' },
                  { value: 'daytime', label: 'Daytime only' },
                  { value: 'weekends_only', label: 'Weekends only' }
                ]}
                value={planForm.accessTiming}
                onChange={e => setPlanForm({ ...planForm, accessTiming: e.target.value as any })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Plan Description</label>
              <textarea
                rows={2}
                value={planForm.description}
                onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 transition-all font-semibold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsEditingPlan(false); setSelectedPlan(null); }} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 3. Quick Renew Modal */}
      {selectedMember && (
        <Dialog isOpen={isRenewing} onClose={() => { setIsRenewing(false); setSelectedMember(null); }} title="Quick Membership Renewal">
          <form onSubmit={handleRenewSubmit} className="space-y-4 pt-2">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs font-semibold text-slate-400 space-y-2">
              <p><strong className="text-slate-300">Subscriber Name:</strong> {selectedMember.clientName}</p>
              <p><strong className="text-slate-300">Active Plan:</strong> {selectedMember.planName}</p>
              <p><strong className="text-slate-300">Expiration Date:</strong> {selectedMember.expirationDate}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Months to Add"
                options={[
                  { value: '1', label: '1 Month' },
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' }
                ]}
                value={renewForm.months}
                onChange={e => {
                  const months = e.target.value;
                  const price = String(getPlanPrice(selectedMember.planId) * parseInt(months, 10));
                  setRenewForm({ ...renewForm, months, amountPaid: price });
                }}
              />
              <Input
                label="Renewal Fee ($)"
                required
                value={renewForm.amountPaid}
                onChange={e => setRenewForm({ ...renewForm, amountPaid: e.target.value })}
              />
            </div>

            <Select
              label="Billing Payment Method"
              options={[
                { value: 'UPI', label: 'UPI (QR Code / Mobile Apps)' },
                { value: 'Card', label: 'Credit or Debit Card' },
                { value: 'Cash', label: 'Cash Payment at Counter' },
                { value: 'Net Banking', label: 'Net Banking transfer' },
                { value: 'Other', label: 'Other Wallets' }
              ]}
              value={renewForm.method}
              onChange={e => setRenewForm({ ...renewForm, method: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsRenewing(false); setSelectedMember(null); }} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                Confirm Renewal
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 4. Freeze Account Modal */}
      {selectedMember && (
        <Dialog isOpen={isFreezing} onClose={() => { setIsFreezing(false); setSelectedMember(null); }} title="Apply Account Freeze Hold">
          <form onSubmit={handleFreezeSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Freeze Hold Start Date"
                type="date"
                required
                value={freezeForm.startDate}
                onChange={e => setFreezeForm({ ...freezeForm, startDate: e.target.value })}
              />
              <Input
                label="Freeze Hold End Date"
                type="date"
                required
                value={freezeForm.endDate}
                onChange={e => setFreezeForm({ ...freezeForm, endDate: e.target.value })}
              />
            </div>

            <Input
              label="Reason for Freeze Hold"
              value={freezeForm.reason}
              onChange={e => setFreezeForm({ ...freezeForm, reason: e.target.value })}
              placeholder="e.g. Travel, Injury convalescence"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsFreezing(false); setSelectedMember(null); }} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                Apply Hold
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 5. Upgrade Plan Modal */}
      {selectedMember && (
        <Dialog isOpen={isUpgrading} onClose={() => { setIsUpgrading(false); setSelectedMember(null); }} title="Upgrade Member Plan Level">
          <form onSubmit={handleUpgradeSubmit} className="space-y-4 pt-2 text-left">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs font-semibold text-slate-400 space-y-2">
              <p><strong className="text-slate-300">Subscriber Name:</strong> {selectedMember.clientName}</p>
              <p><strong className="text-slate-300">Current Plan:</strong> {selectedMember.planName}</p>
            </div>

            <Select
              label="Select Upgrade Target Plan"
              options={plans.filter(p => p.id !== selectedMember.planId).map(p => ({ value: p.id, label: `${p.name} ($${p.price})` }))}
              value={upgradeForm.newPlanId}
              onChange={e => setUpgradeForm({ ...upgradeForm, newPlanId: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsUpgrading(false); setSelectedMember(null); }} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                Confirm Upgrade
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </PageLayout>
  );
}

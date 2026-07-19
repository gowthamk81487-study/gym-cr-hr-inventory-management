'use client';

import React, { useState, useMemo } from 'react';
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
  Activity,
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
  Info
} from 'lucide-react';
import { mockMembershipPlans, mockClientMemberships, GymMembershipPlan, ClientMembershipRecord } from '@/mock/memberships';
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

export default function MembershipsPage() {
  const { showToast } = useToast();

  // Local state to simulate additions and upgrades
  const [plans, setPlans] = useState<GymMembershipPlan[]>(mockMembershipPlans);
  const [memberships, setMemberships] = useState<ClientMembershipRecord[]>(mockClientMemberships);
  
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

  // Overlay Trigger togglers
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    newPlanId: 'premium-vip-yearly'
  });

  // 1. Dashboard summary aggregations
  const dashboardStats = useMemo(() => {
    const active = memberships.filter(m => m.status === 'active' || m.status === 'renewed').length;
    const expiring = memberships.filter(m => m.status === 'expiring_soon').length;
    const expired = memberships.filter(m => m.status === 'expired').length;
    const frozen = memberships.filter(m => m.status === 'frozen').length;
    const revenue = memberships.reduce((acc, m) => {
      const planPrice = plans.find(p => p.id === m.planId)?.price || 49;
      return acc + planPrice;
    }, 0);
    return { active, expiring, expired, frozen, revenue };
  }, [memberships, plans]);

  // 2. Filtered lists
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

  // 3. Paginated slices
  const paginatedSubscribers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredSubscribers.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSubscribers, currentPage]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  // Form Handlers
  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddingPlan(false);

      const newPlan: GymMembershipPlan = {
        id: `plan-${Date.now()}`,
        name: planForm.name,
        description: planForm.description,
        durationMonths: parseInt(planForm.durationMonths, 10),
        price: parseFloat(planForm.price),
        discount: parseFloat(planForm.discount),
        gstPercent: parseFloat(planForm.gstPercent),
        enrollmentFee: parseFloat(planForm.enrollmentFee),
        renewalFee: parseFloat(planForm.renewalFee || planForm.price),
        freezeAllowed: planForm.freezeAllowed === 'true',
        maxFreezeDays: parseInt(planForm.maxFreezeDays, 10),
        transferAllowed: planForm.transferAllowed === 'true',
        guestPassCount: parseInt(planForm.guestPassCount, 10),
        ptSessionsCount: parseInt(planForm.ptSessionsCount, 10),
        dietConsultsCount: parseInt(planForm.dietConsultsCount, 10),
        workoutConsultsCount: parseInt(planForm.workoutConsultsCount, 10),
        accessTiming: planForm.accessTiming,
        status: 'active',
        notes: planForm.notes
      };

      setPlans([...plans, newPlan]);
      setPlanForm({
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
        accessTiming: '24_7',
        notes: ''
      });
      showToast('New membership plan created!', 'success');
    }, 1200);
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !planForm.name || !planForm.price) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditingPlan(false);

      const updated = plans.map(p => {
        if (p.id === selectedPlan.id) {
          return {
            ...p,
            name: planForm.name,
            description: planForm.description,
            durationMonths: parseInt(planForm.durationMonths, 10),
            price: parseFloat(planForm.price),
            discount: parseFloat(planForm.discount),
            gstPercent: parseFloat(planForm.gstPercent),
            enrollmentFee: parseFloat(planForm.enrollmentFee),
            renewalFee: parseFloat(planForm.renewalFee || planForm.price),
            freezeAllowed: planForm.freezeAllowed === 'true',
            maxFreezeDays: parseInt(planForm.maxFreezeDays, 10),
            transferAllowed: planForm.transferAllowed === 'true',
            guestPassCount: parseInt(planForm.guestPassCount, 10),
            ptSessionsCount: parseInt(planForm.ptSessionsCount, 10),
            dietConsultsCount: parseInt(planForm.dietConsultsCount, 10),
            workoutConsultsCount: parseInt(planForm.workoutConsultsCount, 10),
            accessTiming: planForm.accessTiming,
            notes: planForm.notes
          };
        }
        return p;
      });

      setPlans(updated);
      setSelectedPlan(null);
      showToast('Membership plan updated successfully!', 'success');
    }, 1000);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsRenewing(false);

      const renewed = memberships.map(m => {
        if (m.id === selectedMember.id) {
          const currentExp = new Date(m.expirationDate);
          const addMonths = parseInt(renewForm.months, 10);
          currentExp.setMonth(currentExp.getMonth() + addMonths);
          
          return {
            ...m,
            status: 'active' as const,
            expirationDate: currentExp.toISOString().split('T')[0],
            paymentStatus: 'paid' as const,
            renewalHistory: [
              ...m.renewalHistory,
              {
                renewalDate: new Date().toISOString().split('T')[0],
                amountPaid: parseFloat(renewForm.amountPaid || '49'),
                method: renewForm.method
              }
            ]
          };
        }
        return m;
      });

      setMemberships(renewed);
      setSelectedMember(null);
      showToast('Membership renewed successfully!', 'success');
    }, 1200);
  };

  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsFreezing(false);

      const frozen = memberships.map(m => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            status: 'frozen' as const,
            freezeHistory: [
              ...m.freezeHistory,
              {
                startDate: freezeForm.startDate,
                endDate: freezeForm.endDate,
                reason: freezeForm.reason
              }
            ]
          };
        }
        return m;
      });

      setMemberships(frozen);
      setSelectedMember(null);
      showToast('Membership frozen! Roster access blocked.', 'info');
    }, 1200);
  };

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsUpgrading(false);

      const upgraded = memberships.map(m => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            planId: upgradeForm.newPlanId,
            status: 'active' as const
          };
        }
        return m;
      });

      setMemberships(upgraded);
      setSelectedMember(null);
      showToast('Plan upgraded! Price differentials charged via Stripe.', 'success');
    }, 1200);
  };

  const getPlanName = (id: string) => {
    return plans.find(p => p.id === id)?.name || 'Basic Membership';
  };

  const getPlanPrice = (id: string) => {
    return plans.find(p => p.id === id)?.price || 49;
  };

  const triggerExport = () => {
    showToast('Exporting memberships directory (XLSX format)...', 'info');
    setTimeout(() => {
      showToast('Export successful! Handed over to downloads.', 'success');
    }, 1200);
  };

  const duplicatePlan = (plan: GymMembershipPlan) => {
    const copy: GymMembershipPlan = {
      ...plan,
      id: `plan-copy-${Date.now()}`,
      name: `${plan.name} (Copy)`
    };
    setPlans([...plans, copy]);
    showToast('Plan duplicated successfully.', 'success');
  };

  const archivePlan = (id: string) => {
    const updated = plans.map(p => {
      if (p.id === id) {
        return { ...p, status: (p.status === 'active' ? 'archived' : 'active') as any };
      }
      return p;
    });
    setPlans(updated);
    showToast('Plan status updated.', 'info');
  };

  return (
    <PageLayout
      title="Membership Lifecycle Management"
      description="Create membership tiers, track client subscription terms, freeze accounts, and log renewals."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerExport}
            className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white"
          >
            <FileDown className="h-4 w-4" /> Export Subscribers
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingPlan(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Tab Navigation buttons */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'Subscription Dashboard', icon: Layers },
            { id: 'plans', label: 'Plan Catalog', icon: CreditCard },
            { id: 'subscribers', label: 'Active Subscribers', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-slate-100'
                    : 'border-transparent hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Active Subscriptions" value={dashboardStats.active} icon={CheckCircle} change="Paying monthly" />
              <StatCard title="Expiring Soon" value={dashboardStats.expiring} icon={Clock} change="Renewals pending" changeType="neutral" />
              <StatCard title="Frozen Accounts" value={dashboardStats.frozen} icon={AlertTriangle} change="Access locked" changeType="neutral" />
              <StatCard title="Estimated Revenue" value={`$${dashboardStats.revenue.toLocaleString()}`} icon={DollarSign} change="Stripe MRR estimate" changeType="increase" />
            </div>


            {/* Recent subscription actions feed */}
            <Card className="border-slate-900">
              <CardHeader title="Recent Membership Lifecycle Activity" description="Logs of recent checkouts, freezes, and plan renewals" />
              <CardContent>
                <div className="space-y-4 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                    <p className="text-slate-300">Sarah Jenkins renewed <strong className="text-emerald-400">Basic Monthly</strong> via Stripe gateway.</p>
                    <span className="text-[10px] text-slate-500">10 mins ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/60">
                    <p className="text-slate-300">Marcus Miller frozen membership due to <strong className="text-amber-400">Medical: Shoulder strain</strong>.</p>
                    <span className="text-[10px] text-slate-500">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <p className="text-slate-300">Upgrade: Client CL-003 migrated from Elite Quarterly to <strong className="text-blue-400">Premium VIP Yearly</strong>.</p>
                    <span className="text-[10px] text-slate-500">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Plans Catalog */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {plans.map(plan => (
              <Card key={plan.id} className={`border-slate-900 flex flex-col justify-between group ${plan.status === 'archived' ? 'opacity-40' : ''}`}>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{plan.name}</h4>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                        {plan.accessTiming} access
                      </span>
                    </div>
                    <Badge variant={plan.status === 'active' ? 'emerald' : 'slate'}>{plan.status}</Badge>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 border-t border-slate-950 pt-3">
                    <span className="text-2xl font-black text-white">${plan.price}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">/ {plan.durationMonths} months</span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                    <p>• Freeze allowed: {plan.freezeAllowed ? `Yes (${plan.maxFreezeDays} days)` : 'No'}</p>
                    <p>• Value Add: {plan.ptSessionsCount} PT + {plan.dietConsultsCount} Diet consults</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-950">
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
                          discount: String(plan.discount || 0),
                          gstPercent: String(plan.gstPercent || 18),
                          enrollmentFee: String(plan.enrollmentFee || 0),
                          renewalFee: String(plan.renewalFee || plan.price),
                          freezeAllowed: String(plan.freezeAllowed),
                          maxFreezeDays: String(plan.maxFreezeDays || 30),
                          transferAllowed: String(plan.transferAllowed || false),
                          guestPassCount: String(plan.guestPassCount || 0),
                          ptSessionsCount: String(plan.ptSessionsCount || 0),
                          dietConsultsCount: String(plan.dietConsultsCount || 0),
                          workoutConsultsCount: String(plan.workoutConsultsCount || 0),
                          accessTiming: plan.accessTiming,
                          notes: plan.notes || ''
                        });
                        setIsEditingPlan(true);
                      }}
                      className="flex-1 text-[10px] py-1 border-slate-800"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicatePlan(plan)} className="flex-1 text-[10px] py-1 border-slate-800">
                      <Copy className="h-3 w-3" /> Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archivePlan(plan.id)}
                      className={`flex-1 text-[10px] py-1 border-slate-800 ${plan.status === 'active' ? 'text-rose-400' : 'text-emerald-400'}`}
                    >
                      {plan.status === 'active' ? 'Archive' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Active Subscribers Lifecycle grid */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <div className="relative w-full md:max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search subscriber by name, ID or phone..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Select
                  options={[
                    { value: 'all', label: 'All Plans' },
                    ...plans.map(p => ({ value: p.id, label: p.name }))
                  ]}
                  value={filterPlan}
                  onChange={e => { setFilterPlan(e.target.value); setCurrentPage(1); }}
                />
                <Select
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'expiring_soon', label: 'Expiring Soon' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'frozen', label: 'Frozen' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client ID</th>
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Assigned Plan</th>
                    <th className="p-3">Cycle Joined</th>
                    <th className="p-3">Expiration Date</th>
                    <th className="p-3">Billing Status</th>
                    <th className="p-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedSubscribers.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{sub.clientId}</td>
                      <td className="p-3 font-bold text-slate-200">
                        <div>
                          <p>{sub.clientName}</p>
                          <span className="text-[9px] text-slate-500 font-medium block">{sub.clientPhone}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-xs text-slate-300">{getPlanName(sub.planId)}</p>
                          <span className="text-[9px] text-slate-500 block">${getPlanPrice(sub.planId)} / {sub.durationMonths}m</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{sub.joinDate}</td>
                      <td className="p-3 font-mono text-slate-500">
                        <span className={sub.status === 'expiring_soon' ? 'text-amber-400 font-black' : sub.status === 'expired' ? 'text-rose-400 font-black' : ''}>
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
                                setIsUpgrading(true);
                              }
                            },
                            {
                              label: 'Cancel Plan',
                              icon: UserX,
                              danger: true,
                              onClick: () => {
                                setMemberships(prev =>
                                  prev.map(m => m.id === sub.id ? { ...m, status: 'cancelled' as const } : m)
                                );
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
                      <td colSpan={7} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        No client subscriptions match the filters selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* OVERLAY DIALOGS & FORMS */}

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
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Create Plan
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Quick Renew Modal */}
      {selectedMember && (
        <Dialog isOpen={isRenewing} onClose={() => setIsRenewing(false)} title={`Renew Subscription: ${selectedMember.clientName}`}>
          <form onSubmit={handleRenewSubmit} className="space-y-4 pt-2">
            
            <Select
              label="Renewal Term Extension"
              options={[
                { value: '1', label: 'Extend 1 Month' },
                { value: '3', label: 'Extend 3 Months' },
                { value: '12', label: 'Extend 1 Year (12 Months)' }
              ]}
              value={renewForm.months}
              onChange={e => setRenewForm({ ...renewForm, months: e.target.value })}
            />

            <Input
              label="Amount Billed ($)"
              type="number"
              value={renewForm.amountPaid}
              onChange={e => setRenewForm({ ...renewForm, amountPaid: e.target.value })}
            />

            <Select
              label="Receipt Gateway Method"
              options={[
                { value: 'Stripe Credit', label: 'Stripe Card Processor' },
                { value: 'UPI Wallet', label: 'Direct UPI App QR' },
                { value: 'Cash On Counter', label: 'Cash desk register' }
              ]}
              value={renewForm.method}
              onChange={e => setRenewForm({ ...renewForm, method: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsRenewing(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Execute Renewal
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 3. Freeze Membership Modal */}
      {selectedMember && (
        <Dialog isOpen={isFreezing} onClose={() => setIsFreezing(false)} title={`Freeze Account: ${selectedMember.clientName}`}>
          <form onSubmit={handleFreezeSubmit} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Freeze Start Date"
                type="date"
                required
                value={freezeForm.startDate}
                onChange={e => setFreezeForm({ ...freezeForm, startDate: e.target.value })}
                className="scheme-dark"
              />
              <Input
                label="Freeze End Date"
                type="date"
                required
                value={freezeForm.endDate}
                onChange={e => setFreezeForm({ ...freezeForm, endDate: e.target.value })}
                className="scheme-dark"
              />
            </div>

            <Select
              label="Reason for Freeze"
              options={[
                { value: 'Medical: Shoulder strain', label: 'Medical Injury (Shoulder / Spine)' },
                { value: 'Temporary travel out of city', label: 'Business / Holiday Travel' },
                { value: 'Personal family emergency', label: 'Personal emergency' }
              ]}
              value={freezeForm.reason}
              onChange={e => setFreezeForm({ ...freezeForm, reason: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsFreezing(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Freeze Subscription
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* 4. Upgrade Membership Modal */}
      {selectedMember && (
        <Dialog isOpen={isUpgrading} onClose={() => setIsUpgrading(false)} title={`Upgrade Plan: ${selectedMember.clientName}`}>
          <form onSubmit={handleUpgradeSubmit} className="space-y-4 pt-2">
            
            <Input
              label="Current Assigned Plan"
              disabled
              value={getPlanName(selectedMember.planId)}
            />

            <Select
              label="Select Upgrade Plan"
              required
              options={plans
                .filter(p => p.id !== selectedMember.planId && p.status === 'active')
                .map(p => ({ value: p.id, label: `${p.name} ($${p.price} / ${p.durationMonths}m)` }))
              }
              value={upgradeForm.newPlanId}
              onChange={e => setUpgradeForm({ ...upgradeForm, newPlanId: e.target.value })}
            />

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-300 block mb-1">Upgrade Math Differential</span>
              Calculated automatically based on unused term days. Target diff invoice will post directly to client billing.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsUpgrading(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Confirm Upgrade
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {/* 5. Edit Membership Plan Modal */}
      {selectedPlan && (
        <Dialog isOpen={isEditingPlan} onClose={() => { setIsEditingPlan(false); setSelectedPlan(null); }} title="Modify Membership Plan">
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
                className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsEditingPlan(false); setSelectedPlan(null); }} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog>
      )}

    </PageLayout>
  );
}

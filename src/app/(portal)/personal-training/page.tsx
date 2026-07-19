'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Target, ShieldCheck, Zap, Award, Dumbbell, Plus, Search, Trash2, Edit2, FileDown, DollarSign, User, CheckCircle, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import { db } from '@/services/db';
import { authService, clientService, coachService, notificationService, paymentService } from '@/services';
import { Client, Coach } from '@/types';
import { exportData } from '@/utils/export';

interface PTPlan {
  id: string;
  name: string;
  hours: number;
  price: number;
  description: string;
  status: 'active' | 'archived';
}

interface PTSubscriber {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  planId: string;
  planName: string;
  hours: number;
  price: number;
  coachId: string;
  coachName: string;
  status: 'active' | 'completed' | 'cancelled';
  paymentMethod: string;
  purchaseDate: string;
}

export default function PersonalTrainingPage() {
  const { showToast } = useToast();
  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lists
  const [plans, setPlans] = useState<PTPlan[]>([]);
  const [subscribers, setSubscribers] = useState<PTSubscriber[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'subscribers'>('dashboard');

  // Modals
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PTPlan | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Client Purchase state
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasePlan, setPurchasePlan] = useState<PTPlan | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    coachId: '',
    paymentMethod: 'UPI'
  });
  const [activeReceipt, setActiveReceipt] = useState<PTSubscriber | null>(null);

  // Plan Form State
  const [planForm, setPlanForm] = useState({
    name: '',
    hours: '10',
    price: '500',
    description: ''
  });

  const loadData = async () => {
    try {
      const storedPlans = db.getCollection<PTPlan>('gym_pt_plans');
      setPlans(storedPlans);

      const storedSubs = db.getCollection<PTSubscriber>('gym_pt_subscribers');
      setSubscribers(storedSubs);

      const coachList = await coachService.getAll();
      setCoaches(coachList);

      const clientList = await clientService.getAll();
      setClients(clientList);

      // Default selected coach for client form
      if (coachList.length > 0 && !purchaseForm.coachId) {
        setPurchaseForm(prev => ({ ...prev, coachId: coachList[0].id }));
      }
    } catch {
      showToast('Error loading personal training collections.', 'error');
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

  const filteredPlans = useMemo(() => {
    return plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [plans, searchQuery]);

  const filteredSubs = useMemo(() => {
    return subscribers.filter(s =>
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscribers, searchQuery]);

  // Client specific details
  const clientSubInfo = useMemo(() => {
    if (!currentUser || role !== 'client') return null;
    return subscribers.find(s => s.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && s.status === 'active');
  }, [subscribers, currentUser, role]);

  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const newPlan: PTPlan = {
      id: `ptp-${Date.now()}`,
      name: planForm.name,
      hours: parseInt(planForm.hours, 10),
      price: parseFloat(planForm.price),
      description: planForm.description,
      status: 'active'
    };

    const updated = [...plans, newPlan];
    db.saveCollection('gym_pt_plans', updated);
    setPlans(updated);
    setIsAddingPlan(false);
    setPlanForm({ name: '', hours: '10', price: '500', description: '' });
    showToast('Personal Training package tier created!', 'success');
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !planForm.name || !planForm.price) return;

    const updated = plans.map(p => {
      if (p.id === selectedPlan.id) {
        return {
          ...p,
          name: planForm.name,
          hours: parseInt(planForm.hours, 10),
          price: parseFloat(planForm.price),
          description: planForm.description
        };
      }
      return p;
    });

    db.saveCollection('gym_pt_plans', updated);
    setPlans(updated);
    setIsEditingPlan(false);
    setSelectedPlan(null);
    setPlanForm({ name: '', hours: '10', price: '500', description: '' });
    showToast('Personal training tier updated.', 'success');
  };

  const handleDeletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    db.saveCollection('gym_pt_plans', updated);
    setPlans(updated);
    showToast('Personal training tier deleted.', 'success');
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchasePlan || !currentUser) return;

    setIsLoading(true);
    try {
      const selectedCoach = coaches.find(c => c.id === purchaseForm.coachId);
      const coachName = selectedCoach ? selectedCoach.name : 'Unassigned';

      // 1. Create PT subscription record
      const newSub: PTSubscriber = {
        id: `PTS-${Date.now().toString().slice(-4)}`,
        clientId: currentUser.entityId || 'CL-999',
        clientName: currentUser.email.split('@')[0], // placeholder fallback
        clientEmail: currentUser.email,
        planId: purchasePlan.id,
        planName: purchasePlan.name,
        hours: purchasePlan.hours,
        price: purchasePlan.price,
        coachId: purchaseForm.coachId,
        coachName: coachName,
        status: 'active',
        paymentMethod: purchaseForm.paymentMethod,
        purchaseDate: new Date().toISOString().split('T')[0]
      };

      // Lookup real client name
      const foundClient = clients.find(c => c.email.toLowerCase() === currentUser.email.toLowerCase());
      if (foundClient) {
        newSub.clientName = foundClient.name;
        // Update client profile in db state
        foundClient.coachId = purchaseForm.coachId;
        foundClient.ptPackage = purchasePlan.name;
        foundClient.paymentStatus = 'paid';
        await clientService.update(foundClient);
      }

      // Save Subscriber
      const storedSubs = db.getCollection<PTSubscriber>('gym_pt_subscribers');
      storedSubs.unshift(newSub);
      db.saveCollection('gym_pt_subscribers', storedSubs);
      setSubscribers(storedSubs);

      // 2. Log in payments ledger
      await paymentService.create({
        id: `PAY-${Date.now().toString().slice(-3)}`,
        clientId: newSub.clientId,
        clientName: newSub.clientName,
        amount: newSub.price,
        date: newSub.purchaseDate,
        status: 'paid',
        paymentMethod: (purchaseForm.paymentMethod.toLowerCase() === 'card' ? 'credit_card' : purchaseForm.paymentMethod.toLowerCase() === 'cash' ? 'cash' : 'upi') as any,
        membershipName: `PT: ${newSub.planName}`
      });

      // 3. Create Notification
      await notificationService.create({
        title: 'PT Plan Enrolled',
        message: `${newSub.clientName} purchased ${newSub.planName} assigned to coach ${newSub.coachName}.`,
        type: 'success',
        targetRole: 'manager'
      });

      showToast('Personal Training plan purchased successfully!', 'success');
      setIsPurchasing(false);
      
      // Load invoice receipt
      setActiveReceipt(newSub);
      loadData();
    } catch {
      showToast('Purchase checkout failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredSubs.length === 0) {
      showToast('No data available to export.', 'error');
      return;
    }

    const headers = ['Subscription ID', 'Client Name', 'Plan Enrolled', 'Trainer Name', 'Hours', 'Rate Paid ($)', 'Method', 'Date Purchased'];
    const rows = filteredSubs.map(s => [
      s.id,
      s.clientName,
      s.planName,
      s.coachName,
      s.hours,
      s.price,
      s.paymentMethod,
      s.purchaseDate
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `PT_Members_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting to CSV initiated.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting to Excel initiated.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Personal Training Subscriber Roster', headers, rows, filename);
      showToast('Exporting to PDF print initiated.', 'success');
    }
  };

  // Render for Client Member view
  if (role === 'client') {
    return (
      <PageLayout
        title="My Personal Training Hub"
        description="Enrol in personal training packages and manage your dedicated physical trainer assignments."
      >
        <div className="space-y-8 py-2 text-left">
          {clientSubInfo ? (
            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
              <CardHeader title="Active PT Package Details" action={<Badge variant="emerald">Active</Badge>} />
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 font-semibold">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">PT Plan Level:</span>
                  <p className="text-sm font-bold text-slate-200">{clientSubInfo.planName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">Assigned Coach:</span>
                  <p className="text-sm font-bold text-slate-200">{clientSubInfo.coachName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">Remaining Hours:</span>
                  <p className="text-sm font-bold text-blue-400 font-mono">{clientSubInfo.hours} Sessions</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-900 text-center py-6">
              <CardContent className="space-y-2">
                <Dumbbell className="h-8 w-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200">No Active PT Subscription Plan</h4>
                <p className="text-[11px] text-slate-500 font-medium max-w-sm mx-auto">
                  Subscribe to a custom 1-on-1 personal training catalog package below to pair with a master trainer.
                </p>
              </CardContent>
            </Card>
          )}

          {/* PT Package list for Clients to buy */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Available Personal Training Packages</h3>
            
            {plans.filter(p => p.status === 'active').length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl font-bold text-xs bg-slate-950/20">
                No Personal Training Plans Available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(p => p.status === 'active').map(plan => (
                  <Card key={plan.id} className="border-slate-900 flex flex-col justify-between hover:border-blue-500/25">
                    <CardContent className="space-y-4 pt-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{plan.name}</h4>
                        <span className="text-[8.5px] font-bold text-blue-400 uppercase tracking-widest block mt-0.5">{plan.hours} Dedicated Coaching Hours</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                      <div className="border-t border-slate-950 pt-3">
                        <span className="text-xl font-black text-white">${plan.price}</span>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase mt-0.5">One-time billing package</span>
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
                        {clientSubInfo ? 'Already Enrolled' : 'Purchase PT Pack'}
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
          <Dialog isOpen={isPurchasing} onClose={() => setIsPurchasing(false)} title={`Purchase Personal Training Package`}>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4 pt-2 text-left">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs font-semibold text-slate-400 space-y-2">
                <p><strong className="text-slate-300">Package Level:</strong> {purchasePlan.name}</p>
                <p><strong className="text-slate-300">Coaching Hours:</strong> {purchasePlan.hours} Hours</p>
                <p><strong className="text-slate-300">Package Cost:</strong> <span className="text-emerald-400 font-bold">${purchasePlan.price}</span></p>
              </div>

              <Select
                label="Assign Personal Coach"
                options={coaches.map(c => ({ value: c.id, label: `${c.name} (${c.specialization})` }))}
                value={purchaseForm.coachId}
                onChange={e => setPurchaseForm({ ...purchaseForm, coachId: e.target.value })}
              />

              <Select
                label="Payment Method Selection"
                options={[
                  { value: 'UPI', label: 'UPI (QR Scan / Mobile App)' },
                  { value: 'Card', label: 'Credit or Debit Card' },
                  { value: 'Cash', label: 'Cash Payment at Counter' },
                  { value: 'Net Banking', label: 'Net Banking transfer' },
                  { value: 'Other', label: 'Other Wallets' }
                ]}
                value={purchaseForm.paymentMethod}
                onChange={e => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button variant="outline" size="sm" onClick={() => setIsPurchasing(false)} disabled={isLoading} className="text-xs">Cancel</Button>
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
                <p>Payment cleared! Personal Training package successfully enrolled.</p>
              </div>

              <div className="border border-slate-900 rounded-xl p-4 space-y-3.5 bg-slate-950/20 font-mono text-[10.5px]">
                <h4 className="text-center font-black border-b border-slate-900 pb-2 text-slate-200">THE GYM FITNESS CLUB INVOICE</h4>
                <p><span className="text-slate-500">Transaction ID:</span> {activeReceipt.id}</p>
                <p><span className="text-slate-500">Client Name:</span> {activeReceipt.clientName}</p>
                <p><span className="text-slate-500">Selected Plan:</span> {activeReceipt.planName}</p>
                <p><span className="text-slate-500">Coaching Hours:</span> {activeReceipt.hours} Hours</p>
                <p><span className="text-slate-500">Assigned Coach:</span> {activeReceipt.coachName}</p>
                <p><span className="text-slate-500">Payment Method:</span> {activeReceipt.paymentMethod}</p>
                <p className="border-t border-slate-900 pt-2 font-black text-slate-200"><span className="text-slate-500 font-medium">TOTAL PAID:</span> ${activeReceipt.price}</p>
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

  // Render for Admin/Manager view
  return (
    <PageLayout
      title="Personal Training Registry"
      description="Manage PT package tariff structures, track member assignments, and audit coach matching."
      actions={
        <div className="flex gap-2">
          {activeTab === 'catalog' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddingPlan(true)}
              className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <Plus className="h-4 w-4" /> Create PT Package
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 py-2 text-left">
        {/* Tab Selector */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'PT Overview', icon: Target },
            { id: 'catalog', label: 'Tariff Catalog', icon: Dumbbell },
            { id: 'subscribers', label: 'Subscribed Members', icon: User }
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

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard title="Active PT Enrolments" value={subscribers.filter(s => s.status === 'active').length} icon={CheckCircle} change="Subscribed members matching" />
              <StatCard title="Completed Programs" value={subscribers.filter(s => s.status === 'completed').length} icon={Clock} change="Completed hours" />
              <StatCard title="PT Estimated Revenue" value={`$${subscribers.reduce((acc, s) => acc + s.price, 0).toLocaleString()}`} icon={DollarSign} change="Cumulative cashflow ledger" changeType="increase" />
            </div>

            <Card className="border-slate-900">
              <CardHeader title="Operational Logs" description="Recent Personal Training subscription and booking updates" />
              <CardContent className="space-y-4 text-xs font-semibold text-slate-400">
                {subscribers.slice(0, 3).map((sub, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-900 last:border-0 last:pb-0">
                    <p className="text-slate-300">
                      {sub.clientName} enrolled in <strong className="text-blue-400">{sub.planName}</strong> with trainer <strong className="text-slate-200">{sub.coachName}</strong>.
                    </p>
                    <span className="text-[10px] text-slate-500">{sub.purchaseDate}</span>
                  </div>
                ))}
                {subscribers.length === 0 && (
                  <div className="text-center text-slate-500 py-6 font-semibold">No recent operational activity.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Catalog plans */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input
                className="pl-9 text-xs"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl font-bold text-xs bg-slate-950/20">
                No Personal Training Plans Available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPlans.map(plan => (
                  <Card key={plan.id} className="border-slate-900 flex flex-col justify-between">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{plan.name}</h4>
                          <span className="text-[9px] font-mono font-bold text-blue-400">{plan.hours} Coaching Hours</span>
                        </div>
                        <Badge variant="emerald">{plan.status}</Badge>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
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
                            hours: String(plan.hours),
                            price: String(plan.price),
                            description: plan.description
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

        {/* Tab 3: Subscribed list */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/10 border border-slate-900 p-4 rounded-xl">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  className="pl-9 text-xs"
                  placeholder="Search by client or trainer..."
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
                    <th className="p-3">Client</th>
                    <th className="p-3">Plan enrolled</th>
                    <th className="p-3">Assigned Trainer</th>
                    <th className="p-3 font-mono">Rate Paid</th>
                    <th className="p-3">Date Enrolled</th>
                    <th className="p-3">Billing Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredSubs.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">
                        <div>
                          <p>{sub.clientName}</p>
                          <span className="text-[9.5px] text-slate-500 font-mono block">{sub.clientEmail}</span>
                        </div>
                      </td>
                      <td className="p-3">{sub.planName}</td>
                      <td className="p-3">{sub.coachName}</td>
                      <td className="p-3 font-mono text-slate-200">${sub.price}</td>
                      <td className="p-3 font-mono text-slate-500">{sub.purchaseDate}</td>
                      <td className="p-3 uppercase font-mono text-slate-500">{sub.paymentMethod}</td>
                      <td className="p-3">
                        <Badge variant={sub.status === 'active' ? 'emerald' : 'slate'}>{sub.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredSubs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No active personal training subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* dialog forms */}
      {/* 1. Add PT Plan Modal */}
      <Dialog isOpen={isAddingPlan} onClose={() => setIsAddingPlan(false)} title="Create PT Plan Package">
        <form onSubmit={handleAddPlanSubmit} className="space-y-4 pt-2">
          <Input
            label="Package Name"
            required
            value={planForm.name}
            onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
            placeholder="24-Hour Recomposition Pack"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dedicated Hours"
              type="number"
              required
              value={planForm.hours}
              onChange={e => setPlanForm({ ...planForm, hours: e.target.value })}
            />
            <Input
              label="Package Cost ($)"
              type="number"
              required
              value={planForm.price}
              onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Package Description</label>
            <textarea
              rows={2}
              value={planForm.description}
              onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Provide target coaching goals, frequency guidelines or nutrition sheet inclusions..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAddingPlan(false)} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">Create Package</Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Edit PT Plan Modal */}
      {selectedPlan && (
        <Dialog isOpen={isEditingPlan} onClose={() => { setIsEditingPlan(false); setSelectedPlan(null); }} title="Edit PT Package Details">
          <form onSubmit={handleEditPlanSubmit} className="space-y-4 pt-2">
            <Input
              label="Package Name"
              required
              value={planForm.name}
              onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Dedicated Hours"
                type="number"
                required
                value={planForm.hours}
                onChange={e => setPlanForm({ ...planForm, hours: e.target.value })}
              />
              <Input
                label="Package Cost ($)"
                type="number"
                required
                value={planForm.price}
                onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Package Description</label>
              <textarea
                rows={2}
                value={planForm.description}
                onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 transition-all font-semibold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => { setIsEditingPlan(false); setSelectedPlan(null); }} className="text-xs">Cancel</Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">Save Changes</Button>
            </div>
          </form>
        </Dialog>
      )}
    </PageLayout>
  );
}

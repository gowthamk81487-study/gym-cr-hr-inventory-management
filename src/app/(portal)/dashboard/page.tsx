'use client';

import React, { useState } from 'react';
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
  Briefcase
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
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { mockDashboardStats, mockActivities, mockAlerts } from '@/mock/data';

export default function DashboardPage() {
  const { showToast } = useToast();
  
  // Modal toggle states
  const [activeModal, setActiveModal] = useState<'client' | 'membership' | 'inventory' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [clientForm, setClientForm] = useState({ name: '', email: '', coach: 'coach-1' });
  const [membershipForm, setMembershipForm] = useState({ name: '', price: '', period: 'monthly' });
  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'supplement', quantity: '' });

  // Statistics state to simulate state updates
  const [stats, setStats] = useState(mockDashboardStats);
  const [activities, setActivities] = useState(mockActivities);

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.email) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveModal(null);
      // Simulate state increase
      setStats(prev => ({
        ...prev,
        totalMembers: prev.totalMembers + 1,
        activeMemberships: prev.activeMemberships + 1
      }));
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          time: 'Just now',
          type: 'registration',
          desc: `New member ${clientForm.name} enrolled in club system.`
        },
        ...prev
      ]);
      setClientForm({ name: '', email: '', coach: 'coach-1' });
      showToast('Client added successfully!', 'success');
    }, 1200);
  };

  const handleAddMembershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipForm.name || !membershipForm.price) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveModal(null);
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          time: 'Just now',
          type: 'registration',
          desc: `New Membership tier "${membershipForm.name}" created at $${membershipForm.price}.`
        },
        ...prev
      ]);
      setMembershipForm({ name: '', price: '', period: 'monthly' });
      showToast('Membership tier created!', 'success');
    }, 1200);
  };

  const handleAddInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.quantity) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveModal(null);
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          time: 'Just now',
          type: 'payment',
          desc: `Stock added: ${inventoryForm.quantity}x ${inventoryForm.name}.`
        },
        ...prev
      ]);
      setInventoryForm({ name: '', category: 'supplement', quantity: '' });
      showToast('Inventory item registered!', 'success');
    }, 1200);
  };

  const triggerReportGeneration = () => {
    showToast('Compiling analytical datasets...', 'info');
    setTimeout(() => {
      showToast('PDF Report generated! Download starting.', 'success');
    }, 1500);
  };

  return (
    <PageLayout
      title="Executive Overview"
      description="Provolution Club real-time analytics and management operations."
    >
      <div className="space-y-8 py-2">
        {/* 1. Quick Actions & Alerts Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Operator Controls</h4>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Provolution Technologies Stage 4 Active
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

        {/* 2. Dashboard KPIs Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            change="+14% this month"
            changeType="increase"
            icon={Users}
            description="Active & inactive member accounts"
          />
          <StatCard
            title="Active Memberships"
            value={stats.activeMemberships}
            change="+5 new today"
            changeType="increase"
            icon={CreditCard}
            description="Currently active recurring plans"
          />
          <StatCard
            title="Month Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change="+8.2% vs last month"
            changeType="increase"
            icon={DollarSign}
            description="Subscription + retail billing ledger"
          />
          <StatCard
            title="Daily Attendance"
            value={stats.attendanceToday}
            change="-4% vs yesterday"
            changeType="decrease"
            icon={Activity}
            description="Check-ins recorded today"
          />
          <StatCard
            title="Accredited Coaches"
            value={stats.coaches}
            change="100% Active"
            changeType="neutral"
            icon={Dumbbell}
            description="Personal trainers and nutritionists"
          />
          <StatCard
            title="Club Staff"
            value={stats.employees}
            change="General & Cleaners"
            changeType="neutral"
            icon={Briefcase}
            description="Receptionists & HR administrators"
          />
          <StatCard
            title="Inventory Alerts"
            value={stats.inventoryAlerts}
            change="Needs restocking"
            changeType="decrease"
            icon={Package}
            description="Products below stock thresholds"
          />
          <StatCard
            title="Pending Renewals"
            value={stats.pendingRenewals}
            change="Next 10 days"
            changeType="neutral"
            icon={Clock}
            description="Plans approaching expiration"
          />
        </div>

        {/* 3. Analytical Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart title="Cashflow Revenue" />
          <MembershipChart title="Active Tiers Split" />
          <AttendanceChart title="Average Daily Checkins" />
          <InventoryChart title="Supplies Stock Status" />
        </div>

        {/* 4. Feeds and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Activity Log */}
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
                {activities.map((act) => (
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

          {/* Warnings and Expirations Feed */}
          <div className="space-y-6">
            
            {/* Low Stock Warns */}
            <Card className="border-slate-900 border-rose-500/10">
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
                <div className="space-y-3 text-xs">
                  {mockAlerts.inventory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      <div>
                        <h5 className="font-bold text-slate-300">{item.name}</h5>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-400 font-black">{item.qty} items left</span>
                        <p className="text-[9px] text-slate-600 font-semibold uppercase">Min limit: {item.threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expiry Renewals */}
            <Card className="border-slate-900 border-amber-500/10">
              <CardHeader
                title="Upcoming Expirations"
                description="Memberships expiring in next 10 days"
                action={
                  <div className="h-7 w-7 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                    <Clock className="h-4 w-4" />
                  </div>
                }
              />
              <CardContent>
                <div className="space-y-3 text-xs">
                  {mockAlerts.renewals.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      <div>
                        <h5 className="font-bold text-slate-300">{member.name}</h5>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{member.plan}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-black">{member.expiryDate}</span>
                        <p className="text-[9px] text-slate-600 font-semibold uppercase">Expires</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* QUICK ACTIONS DIALOG MODALS */}
      
      {/* 1. Add Client Modal */}
      <Dialog
        isOpen={activeModal === 'client'}
        onClose={() => setActiveModal(null)}
        title="Add Member Account"
      >
        <form onSubmit={handleAddClientSubmit} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={clientForm.name}
            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
            placeholder="Sarah Jenkins"
          />
          <Input
            label="Email Address"
            required
            type="email"
            value={clientForm.email}
            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
            placeholder="sarah@example.com"
          />
          <Select
            label="Assign Master Coach"
            options={[
              { value: 'coach-1', label: 'Coach Marcus Sterling (Powerlifting)' },
              { value: 'coach-2', label: 'Coach Elena Rostova (HIIT)' },
              { value: 'coach-3', label: 'Coach Damien Vance (Nutrition)' }
            ]}
            value={clientForm.coach}
            onChange={(e) => setClientForm({ ...clientForm, coach: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Register Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Add Membership Modal */}
      <Dialog
        isOpen={activeModal === 'membership'}
        onClose={() => setActiveModal(null)}
        title="Create Plan Tier"
      >
        <form onSubmit={handleAddMembershipSubmit} className="space-y-4 pt-2">
          <Input
            label="Tier Name"
            required
            value={membershipForm.name}
            onChange={(e) => setMembershipForm({ ...membershipForm, name: e.target.value })}
            placeholder="Elite Coaching Pack"
          />
          <Input
            label="Price Rate ($)"
            required
            type="number"
            value={membershipForm.price}
            onChange={(e) => setMembershipForm({ ...membershipForm, price: e.target.value })}
            placeholder="299"
          />
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
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Create Tier
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Add Inventory Modal */}
      <Dialog
        isOpen={activeModal === 'inventory'}
        onClose={() => setActiveModal(null)}
        title="Register Stock Supplies"
      >
        <form onSubmit={handleAddInventorySubmit} className="space-y-4 pt-2">
          <Input
            label="Product Name"
            required
            value={inventoryForm.name}
            onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
            placeholder="Whey Isolate Protein (Chocolate)"
          />
          <Select
            label="Product Category"
            options={[
              { value: 'supplement', label: 'Supplements / Powders' },
              { value: 'beverage', label: 'Drinks / Energy Cans' },
              { value: 'apparel', label: 'Apparel / Fitness Tees' },
              { value: 'equipment', label: 'Training Accessories' }
            ]}
            value={inventoryForm.category}
            onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
          />
          <Input
            label="Stock Quantity"
            required
            type="number"
            value={inventoryForm.quantity}
            onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
            placeholder="50"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Register Stock
            </Button>
          </div>
        </form>
      </Dialog>

    </PageLayout>
  );
}

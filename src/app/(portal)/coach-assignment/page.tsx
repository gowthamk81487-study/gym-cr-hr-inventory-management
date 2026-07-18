'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Dumbbell,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { mockCoaches, mockClients } from '@/mock/clients';
import { Coach, Client } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { StatCard } from '@/components/common/StatCard';

export default function CoachAssignmentPage() {
  const { showToast } = useToast();

  // Local state to simulate additions and capacity adjustments
  const [coaches, setCoaches] = useState<Coach[]>(
    mockCoaches.map(c => ({
      ...c,
      // Add standard max capacity if not present
      maxCapacity: c.id === 'coach-1' ? 16 : c.id === 'coach-2' ? 25 : c.id === 'coach-3' ? 12 : 10,
      activeClientsCount: c.id === 'coach-1' ? 15 : c.id === 'coach-2' ? 22 : c.id === 'coach-3' ? 10 : 3
    }))
  );
  
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form parameters
  const [form, setForm] = useState({
    clientId: '',
    coachId: '',
    reason: 'Initial onboarding alignment',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');

  // Utilization Computations
  const summary = useMemo(() => {
    const totalCoaches = coaches.length;
    const totalAssigned = coaches.reduce((acc, c) => acc + c.activeClientsCount, 0);
    const maxCapacity = coaches.reduce((acc, c) => acc + (c.maxCapacity || 10), 0);
    const availableSlots = maxCapacity - totalAssigned;
    const avgUtilization = Math.round((totalAssigned / maxCapacity) * 100);
    return { totalCoaches, totalAssigned, availableSlots, avgUtilization, maxCapacity };
  }, [coaches]);

  // Filtered Coaches Grid
  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach => {
      const matchSearch =
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      
      const freeSlots = (coach.maxCapacity || 10) - coach.activeClientsCount;
      const matchAvail =
        filterAvailability === 'all' ||
        (filterAvailability === 'available' && freeSlots > 0) ||
        (filterAvailability === 'full' && freeSlots <= 0);

      return matchSearch && matchAvail;
    });
  }, [coaches, searchQuery, filterAvailability]);

  // Client dropdown lookup (only display clients who don't have a coach or need reassignment)
  const availableClientsDropdown = useMemo(() => {
    return clients.map(c => ({
      value: c.id,
      label: `${c.name} (${c.id})`
    }));
  }, [clients]);

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.coachId) {
      showToast('Please select both a client and a target coach.', 'error');
      return;
    }

    const selectedCoach = coaches.find(c => c.id === form.coachId);
    if (selectedCoach && selectedCoach.activeClientsCount >= (selectedCoach.maxCapacity || 10)) {
      showToast(`Warning: Coach ${selectedCoach.name} has reached maximum capacity limits.`, 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAssigning(false);

      // 1. Update coach active client counters
      setCoaches(prevCoaches =>
        prevCoaches.map(c => {
          if (c.id === form.coachId) {
            return { ...c, activeClientsCount: c.activeClientsCount + 1 };
          }
          return c;
        })
      );

      // 2. Update client's active coach ID
      setClients(prevClients =>
        prevClients.map(c => {
          if (c.id === form.clientId) {
            return { ...c, coachId: form.coachId };
          }
          return c;
        })
      );

      setForm({
        clientId: '',
        coachId: '',
        reason: 'Initial onboarding alignment',
        effectiveDate: new Date().toISOString().split('T')[0],
        notes: ''
      });

      showToast('Coach assigned successfully! Capacity lists updated.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title="Coach Assignment Hub"
      description="Monitor training roster availability, balance workload distributions, and manage assignments."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAssigning(true)}
          className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          <UserPlus className="h-4 w-4" /> New Assignment
        </Button>
      }
    >
      <div className="space-y-6 py-2">
        {/* 1. Utilization KPIs Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Coaches" value={summary.totalCoaches} icon={Dumbbell} change="Roster Staff" />
          <StatCard title="Active Clients" value={summary.totalAssigned} icon={Users} change={`Max capacity: ${summary.maxCapacity}`} changeType="neutral" />
          <StatCard title="Available Slots" value={summary.availableSlots} icon={CheckCircle} changeType="increase" change="Across all trainers" />
          <StatCard title="Average Utilization" value={`${summary.avgUtilization}%`} icon={Layers} change={summary.avgUtilization > 85 ? 'High workload warn' : 'Healthy balance'} changeType={summary.avgUtilization > 85 ? 'decrease' : 'increase'} />
        </div>

        {/* 2. AI Workload Balancing Recommendations Panel (Stubs Blueprint) */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                AI Workload Suggestions <Badge variant="blue">Smart Recommendation</Badge>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                Coach Elena Rostova is approaching maximum capacity (22/25). Recommend routeing new weight-loss inquiries to Coach Jack Harkness (spec: HIIT Bootcamp, 3/10 slots).
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('AI workload balance optimized!', 'success')}
            className="text-[10px] py-1 border-slate-800 text-blue-400 hover:text-blue-300 font-bold shrink-0 cursor-pointer"
          >
            Auto Balance
          </Button>
        </div>

        {/* 3. Search & Capacity Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 rounded-xl p-4">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search coach by name or specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
            />
          </div>

          <div className="w-full md:w-48 shrink-0">
            <Select
              options={[
                { value: 'all', label: 'All Availability' },
                { value: 'available', label: 'With Open Slots' },
                { value: 'full', label: 'At Max Capacity' }
              ]}
              value={filterAvailability}
              onChange={e => setFilterAvailability(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Coach Capacity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCoaches.map(coach => {
            const current = coach.activeClientsCount;
            const max = coach.maxCapacity || 10;
            const slots = max - current;
            const percent = Math.round((current / max) * 100);
            
            // Utilization indicator colors
            const indicatorColor = percent >= 90 ? 'danger' : percent >= 75 ? 'warning' : 'success';
            const badgeLabel = slots <= 0 ? 'Fully Loaded' : `${slots} Slots Open`;

            return (
              <Card key={coach.id} className="border-slate-900 flex flex-col justify-between group">
                <CardContent className="space-y-4">
                  
                  {/* Coach Card Header */}
                  <div className="flex items-center gap-3">
                    <Avatar name={coach.name} src={coach.profilePic} size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{coach.name}</h4>
                      <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{coach.specialization}</p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 border-t border-slate-950 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className="uppercase tracking-wider">Utilization Ratios</span>
                      <span className={percent >= 90 ? 'text-rose-400' : 'text-slate-300'}>
                        {current} / {max} Clients ({percent}%)
                      </span>
                    </div>
                    <ProgressBar value={percent} variant={indicatorColor} size="xs" />
                  </div>

                  {/* Badges footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-950 text-[10px] font-bold">
                    <Badge variant={slots <= 0 ? 'rose' : slots <= 2 ? 'warning' : 'emerald'}>
                      {badgeLabel}
                    </Badge>
                    <span className="text-slate-500 font-medium">Exp: {coach.experienceYears} Years</span>
                  </div>

                </CardContent>
              </Card>
            );
          })}

          {filteredCoaches.length === 0 && (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 font-medium border border-dashed border-slate-900 rounded-xl">
              No certified coaches match your search criteria.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN COACH MODAL DIALOG */}
      <Dialog isOpen={isAssigning} onClose={() => setIsAssigning(false)} title="Create Coach Assignment">
        <form onSubmit={handleAssignmentSubmit} className="space-y-4 pt-2">
          
          <Select
            label="Target Client"
            required
            options={availableClientsDropdown}
            value={form.clientId}
            onChange={e => setForm({ ...form, clientId: e.target.value })}
          />

          <Select
            label="Target Coach"
            required
            options={coaches.map(c => ({
              value: c.id,
              label: `${c.name} (${c.activeClientsCount}/${c.maxCapacity} assigned)`
            }))}
            value={form.coachId}
            onChange={e => setForm({ ...form, coachId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Transition Reason"
              options={[
                { value: 'Initial onboarding alignment', label: 'Onboarding Alignment' },
                { value: 'Workload optimization balancing', label: 'Workload Optimization' },
                { value: 'Specialized health goal shift', label: 'Fitness Goal Shift' },
                { value: 'Coach shift scheduling leave', label: 'Trainer Scheduled Leave' }
              ]}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
            <Input
              label="Effective Date"
              type="date"
              required
              value={form.effectiveDate}
              onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
              className="scheme-dark"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operator Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Detail transition parameters, workout records handover, or schedule constraints..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAssigning(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Assign Coach
            </Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

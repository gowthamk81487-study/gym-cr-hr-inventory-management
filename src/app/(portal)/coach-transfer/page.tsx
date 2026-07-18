'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Dumbbell,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  History,
  FileText,
  UserCheck,
  TrendingUp,
  Search,
  BookOpen,
  Plus,
  ArrowLeftRight
} from 'lucide-react';
import { mockCoaches, mockClients } from '@/mock/clients';
import { Coach, Client } from '@/types';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';

// Mock Seed for Transfer History Logs
interface TransferLog {
  id: string;
  clientName: string;
  clientId: string;
  fromCoachName: string;
  toCoachName: string;
  transferDate: string;
  reason: string;
  status: 'Approved' | 'Pending';
  prevNotes: string;
}

const initialTransferLogs: TransferLog[] = [
  {
    id: 'trsf-1',
    clientId: 'CL-001',
    clientName: 'Sarah Jenkins',
    fromCoachName: 'Marcus Sterling',
    toCoachName: 'Elena Rostova',
    transferDate: '2026-06-12',
    reason: 'Specialized health goal shift',
    status: 'Approved',
    prevNotes: 'Transitioned to HIIT focus to accelerate fat loss. Core lift forms are stable.'
  },
  {
    id: 'trsf-2',
    clientId: 'CL-002',
    clientName: 'David Vance',
    fromCoachName: 'Damien Vance',
    toCoachName: 'Marcus Sterling',
    transferDate: '2026-07-01',
    reason: 'Powerlifting focus',
    status: 'Approved',
    prevNotes: 'Nutritional macros are balanced. Needs strict coach guidance on squat/deadlift loading ratios.'
  }
];

export default function CoachTransferPage() {
  const { showToast } = useToast();

  const coaches = mockCoaches;
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>(initialTransferLogs);
  
  // Dialogs
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timelineClient, setTimelineClient] = useState<Client | null>(mockClients[0]); // default to first client to show timeline

  // Form parameters
  const [form, setForm] = useState({
    clientId: '',
    toCoachId: '',
    reason: 'Specialized health goal shift',
    transferDate: new Date().toISOString().split('T')[0],
    prevNotes: '',
    newNotes: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Selected Client current coach helper
  const selectedClientRecord = useMemo(() => {
    return clients.find(c => c.id === form.clientId) || null;
  }, [clients, form.clientId]);

  const currentCoachName = useMemo(() => {
    if (!selectedClientRecord) return 'No Client Selected';
    return coaches.find(c => c.id === selectedClientRecord.coachId)?.name || 'Unassigned';
  }, [selectedClientRecord, coaches]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return transferLogs.filter(log =>
      log.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.fromCoachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.toCoachName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transferLogs, searchQuery]);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.toCoachId) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (selectedClientRecord && selectedClientRecord.coachId === form.toCoachId) {
      showToast('Error: Client is already assigned to this coach.', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsTransferring(false);

      const targetCoach = coaches.find(c => c.id === form.toCoachId);
      const prevCoach = coaches.find(c => c.id === selectedClientRecord?.coachId);

      const newLog: TransferLog = {
        id: `trsf-${Date.now()}`,
        clientId: form.clientId,
        clientName: selectedClientRecord?.name || 'Unknown Client',
        fromCoachName: prevCoach?.name || 'Unassigned',
        toCoachName: targetCoach?.name || 'Unassigned',
        transferDate: form.transferDate,
        reason: form.reason,
        status: 'Approved',
        prevNotes: form.prevNotes
      };

      // 1. Update transfer log list
      setTransferLogs([newLog, ...transferLogs]);

      // 2. Update active client coach assignment locally
      setClients(prevClients =>
        prevClients.map(c => {
          if (c.id === form.clientId) {
            return {
              ...c,
              coachId: form.toCoachId,
              notes: `${c.notes || ''}\n\n[Transfer ${form.transferDate}] Handover notes: ${form.newNotes}`
            };
          }
          return c;
        })
      );

      // Auto update current timeline view to display the newly transferred client's journey
      const updatedClientRecord = clients.find(c => c.id === form.clientId);
      if (updatedClientRecord) {
        setTimelineClient({
          ...updatedClientRecord,
          coachId: form.toCoachId
        });
      }

      setForm({
        clientId: '',
        toCoachId: '',
        reason: 'Specialized health goal shift',
        transferDate: new Date().toISOString().split('T')[0],
        prevNotes: '',
        newNotes: ''
      });

      showToast('Coach transferred successfully! Continuity logs updated.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title="Continuity Handover Ledger"
      description="Track client coaching journeys, perform coach transfers, and audit transition timelines."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsTransferring(true)}
          className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          <ArrowLeftRight className="h-4 w-4" /> Transfer Coach
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2 items-start">
        
        {/* Left Side: Audit Table & Search Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Transfer Audit Logs</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Chronological transition registers</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
                />
              </div>
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client</th>
                    <th className="p-3">Previous Coach</th>
                    <th className="p-3">New Coach</th>
                    <th className="p-3">Transfer Reason</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{log.clientName}</td>
                      <td className="p-3">{log.fromCoachName}</td>
                      <td className="p-3 text-blue-400">{log.toCoachName}</td>
                      <td className="p-3 text-slate-500">{log.reason}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{log.transferDate}</td>
                      <td className="p-3 text-right">
                        <Badge variant="success">{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        No coach transfer audit logs match the query search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Continuity Journey Timeline */}
        <div className="space-y-6">
          <Card className="border-slate-900">
            <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/40">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Client Continuity Timeline</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Verification of zero data loss</p>
              </div>
              <div className="w-40 shrink-0">
                <Select
                  options={clients.slice(0, 10).map(c => ({ value: c.id, label: c.name }))}
                  value={timelineClient?.id || ''}
                  onChange={e => {
                    const selected = clients.find(c => c.id === e.target.value);
                    if (selected) setTimelineClient(selected);
                  }}
                  className="text-[10px]"
                />
              </div>
            </div>
            
            <CardContent className="pt-4">
              {timelineClient ? (
                <div className="space-y-6 relative pl-4 border-l border-slate-900">
                  
                  {/* Step 1: Enrolled */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 border border-slate-950 ring-4 ring-blue-500/10" />
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{timelineClient.joinDate}</span>
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Club Onboarding Completed</h5>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Member enrolled in {timelineClient.membershipId === 'premium-vip-yearly' ? 'VIP Yearly' : 'Monthly Club'} plan. Biometrics check-in completed.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Plan and Routines Assigned */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 border border-slate-950 ring-4 ring-blue-500/10" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Routines & Goals Configured</h5>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Fitness Target: <strong className="text-blue-400 uppercase text-[9px] tracking-wider">{timelineClient.fitnessGoal.replace('_', ' ')}</strong>. Height: {timelineClient.heightCm} cm / Weight: {timelineClient.weightKg} kg (BMI: {timelineClient.bmi}).
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Coach Assignment/Transfer */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-950 ring-4 ring-emerald-500/10" />
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active Alignment</span>
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Coach Assigned</h5>
                      <div className="flex items-center gap-2.5 bg-slate-950/60 p-2 border border-slate-900 rounded-lg">
                        <Avatar name={coaches.find(c => c.id === timelineClient.coachId)?.name || 'Coach'} size="xs" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-300">
                            {coaches.find(c => c.id === timelineClient.coachId)?.name || 'Unassigned'}
                          </p>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                            {coaches.find(c => c.id === timelineClient.coachId)?.specialization || 'Coaching'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Continuity Handover notes */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-700 border border-slate-950" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Continuity Handover Log</h5>
                      <div className="bg-slate-950/40 p-2.5 border border-slate-900 rounded-lg text-[10px] text-slate-400 font-medium italic space-y-1.5">
                        <p className="leading-relaxed">"{timelineClient.notes || 'No active notes handover. Previous biometric parameters saved.'}"</p>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 font-medium text-xs">
                  Select a client to visualize continuity handovers.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* COACH TRANSFER MODAL DIALOG */}
      <Dialog isOpen={isTransferring} onClose={() => setIsTransferring(false)} title="Transfer Coach Alignment">
        <form onSubmit={handleTransferSubmit} className="space-y-4 pt-2">
          
          <Select
            label="Target Client"
            required
            options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))}
            value={form.clientId}
            onChange={e => setForm({ ...form, clientId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transfer From (Current)"
              disabled
              value={currentCoachName}
            />
            <Select
              label="Transfer To (New Coach)"
              required
              options={coaches.map(c => ({
                value: c.id,
                label: `${c.name} (${c.activeClientsCount}/${c.maxCapacity} assigned)`
              }))}
              value={form.toCoachId}
              onChange={e => setForm({ ...form, toCoachId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Transfer Trigger Reason"
              options={[
                { value: 'Specialized health goal shift', label: 'Fitness Goal Shift' },
                { value: 'Coach shift scheduling leave', label: 'Trainer Scheduled Leave' },
                { value: 'Workload optimization balancing', label: 'Workload Balance' },
                { value: 'Member preference request', label: 'Member Preference' }
              ]}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
            <Input
              label="Transition Date"
              type="date"
              required
              value={form.transferDate}
              onChange={e => setForm({ ...form, transferDate: e.target.value })}
              className="scheme-dark"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Handover Notes (Previous Coach)</label>
            <textarea
              rows={2}
              value={form.prevNotes}
              onChange={e => setForm({ ...form, prevNotes: e.target.value })}
              placeholder="E.g., Cardio targets are hit. Client needs squat form monitoring."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Onboarding Directives (New Coach)</label>
            <textarea
              rows={2}
              value={form.newNotes}
              onChange={e => setForm({ ...form, newNotes: e.target.value })}
              placeholder="Instructions or schedule limits for new trainer..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsTransferring(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Execute Transfer
            </Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

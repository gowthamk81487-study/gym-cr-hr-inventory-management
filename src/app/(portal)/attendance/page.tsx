'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  Layers,
  CheckCircle,
  AlertTriangle,
  Play,
  FileDown,
  Info,
  ChevronRight,
  TrendingUp,
  MapPin,
  Camera,
  Nfc
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
import { authService, clientService, coachService, notificationService } from '@/services';
import { db } from '@/services/db';
import { AttendanceRecord } from '@/mock/attendance';
import { Client, Coach } from '@/types';

export default function AttendancePage() {
  const { showToast } = useToast();

  // Session state
  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);

  // Local State
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'logs'>('dashboard');

  // Client Intimation States
  const [attendanceIntimated, setAttendanceIntimated] = useState(false);
  const [intimationForm, setIntimationForm] = useState({
    status: 'coming_today',
    arrivalTime: '09:00',
    remarks: ''
  });

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Records
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Dialog triggers
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [checkinForm, setCheckinForm] = useState({
    clientId: 'CL-001',
    checkInTime: '09:00',
    remarks: 'Morning leg session'
  });

  const [checkoutForm, setCheckoutForm] = useState({
    checkOutTime: '10:30',
    durationMins: '90',
    remarks: 'Strong session, high energy.',
    coachInteraction: 'Elena Rostova'
  });

  const loadData = async () => {
    try {
      const cur = authService.getCurrentUser();
      setCurrentUser(cur);
      if (cur) {
        setRole(cur.role);
        if (cur.role === 'client') {
          const cls = await clientService.getAll();
          const p = cls.find(c => c.id === cur.entityId || c.email === cur.email);
          if (p) setClientProfile(p);
        }
      }

      // Fetch attendance logs from collection
      const list = db.getCollection<AttendanceRecord>('gym_attendance');
      setLogs(list);
    } catch {
      showToast('Error loading attendance logs.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Dashboard summary numbers
  const dashboardStats = useMemo(() => {
    const today = '2026-07-18';
    const todayLogs = logs.filter(l => l.date === today);
    const checkinsCount = todayLogs.filter(l => l.status === 'present' || l.status === 'late').length;
    const insideCount = todayLogs.filter(l => !l.checkOutTime && l.status === 'present').length;
    const absenteesCount = todayLogs.filter(l => l.status === 'absent').length;
    const avgDailyRate = 84; // percentage
    return { checkinsCount, insideCount, absenteesCount, avgDailyRate };
  }, [logs]);

  // 2. Filtered Sub-catalogs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      // Role scoping
      if (role === 'client' && l.clientId !== clientProfile?.id) {
        return false;
      }

      const matchSearch =
        l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.clientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, filterStatus, role, clientProfile]);

  // Paginated slices
  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Currently inside members (no checkOutTime)
  const insideMembers = useMemo(() => {
    return logs.filter(l => !l.checkOutTime && l.status === 'present');
  }, [logs]);

  // Form Submissions
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate check-in
    const alreadyInside = logs.some(l => l.clientId === checkinForm.clientId && !l.checkOutTime && l.status === 'present');
    if (alreadyInside) {
      showToast('Client is already checked in and inside the gym.', 'error');
      return;
    }

    const cls = await clientService.getAll();
    const targetClient = cls.find(c => c.id === checkinForm.clientId);
    if (!targetClient) return;

    // Check membership validity alert
    if (targetClient.status === 'inactive' || targetClient.status === 'suspended') {
      showToast(`Warning: Client ${targetClient.name} has an INACTIVE/SUSPENDED membership!`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newLog: AttendanceRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        clientId: checkinForm.clientId,
        clientName: targetClient.name,
        membershipName: 'Active membership',
        coachName: 'Elena Rostova',
        checkInTime: checkinForm.checkInTime,
        status: 'present',
        remarks: checkinForm.remarks,
        createdBy: 'Front Desk: Danny',
        date: new Date().toISOString().split('T')[0]
      };

      const updated = [newLog, ...logs];
      db.saveCollection('gym_attendance', updated);
      setLogs(updated);
      setIsCheckingIn(false);
      showToast(`${targetClient.name} checked in successfully!`, 'success');
    } catch {
      showToast('Check-in failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsLoading(true);
    try {
      const updatedLogs = logs.map(l => {
        if (l.id === selectedRecord.id) {
          return {
            ...l,
            checkOutTime: checkoutForm.checkOutTime,
            durationMins: parseInt(checkoutForm.durationMins, 10),
            remarks: checkoutForm.remarks
          };
        }
        return l;
      });

      db.saveCollection('gym_attendance', updatedLogs);
      setLogs(updatedLogs);
      setSelectedRecord(null);
      setIsCheckingOut(false);
      showToast('Check-out completed. Workout session logged.', 'success');
    } catch {
      showToast('Check-out failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Client Intimate Attendance
  const handleIntimateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile) return;

    setIsLoading(true);
    try {
      const coaches = await coachService.getAll();
      const coach = coaches.find(co => co.id === clientProfile.coachId);
      
      const statusLabel =
        intimationForm.status === 'coming_today' ? 'Coming Today' :
        intimationForm.status === 'not_coming' ? 'Not Coming' : 'Expected Arrival';

      // Send alert notification to the coach
      await notificationService.create({
        title: `Attendance Intimation: ${clientProfile.name}`,
        message: `Client ${clientProfile.name} intimated status: ${statusLabel} (${intimationForm.arrivalTime}) remarks: ${intimationForm.remarks || 'None'}`,
        type: 'info',
        targetUserId: coach?.email || 'coach1001@thegymfitnesshub.in'
      });

      setAttendanceIntimated(true);
      showToast('Arrival plans registered. Your coach has been notified!', 'success');
    } catch {
      showToast('Intimation failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerExport = () => {
    showToast('Exporting attendance registry...', 'info');
    setTimeout(() => {
      showToast('Spreadsheet download compiled.', 'success');
    }, 1200);
  };

  // CLIENT PORTAL ATTENDANCE VIEW
  if (role === 'client') {
    return (
      <PageLayout
        title="My Attendance Logs"
        description="Notify your coach of today's training presence and track your daily check-in registry."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
          {/* Intimation Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-900">
              <CardHeader title="Today's Arrival Intimation" description="Set your training status to notify your personal coach." />
              <CardContent className="text-left pt-2">
                {attendanceIntimated ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase">Intimation Submitted</h4>
                    <p className="text-[11px] text-slate-500">
                      Your coach was updated regarding today's expected arrival. Adjustments can be coordinated in your session.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleIntimateAttendance} className="space-y-4">
                    <Select
                      label="My Training Status"
                      options={[
                        { value: 'coming_today', label: 'Coming Today (In-bound)' },
                        { value: 'expected_arrival', label: 'Expected Arrival (Specify time)' },
                        { value: 'not_coming', label: 'Not Coming (Rest day)' }
                      ]}
                      value={intimationForm.status}
                      onChange={e => setIntimationForm({ ...intimationForm, status: e.target.value })}
                    />

                    {intimationForm.status !== 'not_coming' && (
                      <Input
                        label="Expected Arrival Time"
                        type="time"
                        value={intimationForm.arrivalTime}
                        onChange={e => setIntimationForm({ ...intimationForm, arrivalTime: e.target.value })}
                        className="scheme-dark"
                      />
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Access remarks / notes</label>
                      <textarea
                        rows={3}
                        value={intimationForm.remarks}
                        onChange={e => setIntimationForm({ ...intimationForm, remarks: e.target.value })}
                        placeholder="Doing high intensity lower body compound squats today..."
                        className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
                      />
                    </div>

                    <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="w-full text-xs">
                      Submit Intimation
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Personal History Logs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-900">
              <CardHeader title="My Check-in History Logs" description="Audit log of your entries and checkout durations." />
              <CardContent className="p-0 text-left">
                <div className="table-container text-[11px] font-semibold text-slate-400">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                        <th className="p-3">Log Date</th>
                        <th className="p-3">Check-in</th>
                        <th className="p-3">Check-out</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredLogs.map(l => (
                        <tr key={l.id} className="table-row-hover text-slate-300">
                          <td className="p-3 font-mono text-slate-500">{l.date}</td>
                          <td className="p-3 font-mono">{l.checkInTime}</td>
                          <td className="p-3 font-mono">{l.checkOutTime || 'Active'}</td>
                          <td className="p-3 font-mono text-blue-400">{l.durationMins ? `${l.durationMins} mins` : '—'}</td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">{l.remarks}</td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            No attendance history logs recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  // STAFF ATTENDANCE DESK VIEW
  return (
    <PageLayout
      title="Member Attendance & Check-in"
      description="Manage gate controls, search client files, preview scanned barcodes, and track inside occupancy."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScannerOpen(true)}
            className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white"
          >
            <Camera className="h-4 w-4" /> Simulate Scan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCheckingIn(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Manual Check-in
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Tab Navigation buttons */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'dashboard', label: 'Attendance Dashboard', icon: Layers },
            { id: 'checkin', label: 'Check-in Desk', icon: UserCheck },
            { id: 'logs', label: 'Attendance Registry', icon: CalendarIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Today's Check-ins" value={dashboardStats.checkinsCount} icon={UserCheck} change="Completed entries" />
              <StatCard title="Currently Inside" value={dashboardStats.insideCount} icon={Users} change="Active on gym floor" changeType="increase" />
              <StatCard title="Today's Absentees" value={dashboardStats.absenteesCount} icon={UserX} change="No checkin logged" changeType="neutral" />
              <StatCard title="Average Rate" value={`${dashboardStats.avgDailyRate}%`} icon={TrendingUp} change="Daily client checkin average" changeType="increase" />
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gate Hardware Integrations (Stage 9 Prep)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold mt-1">
                    Connect local QR scanners, RFID barcode sensors, fingerprint access locks, or NFC cards to feed the check-in queue instantly.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast('RFID Scanner online.', 'success')}
                  className="text-[10px] py-1 border-slate-800 text-blue-400 hover:text-blue-300 font-bold shrink-0 cursor-pointer"
                >
                  <Nfc className="h-3 w-3" /> NFC RFID Setup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast('Geofence triggers verified.', 'info')}
                  className="text-[10px] py-1 border-slate-800 text-slate-400 hover:text-white font-bold shrink-0 cursor-pointer"
                >
                  <MapPin className="h-3 w-3" /> Geofence
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Check-in Desk */}
        {activeTab === 'checkin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fadeIn">
            <div className="md:col-span-2 space-y-4">
              <Card className="border-slate-900">
                <CardHeader title="Members Currently Inside Gym" description="Active workout sessions awaiting check-out" />
                <CardContent>
                  {insideMembers.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs py-4 font-semibold">No members checked in currently.</p>
                  ) : (
                    <div className="divide-y divide-slate-900/60 font-semibold text-xs text-left">
                      {insideMembers.map(sub => (
                        <div key={sub.id} className="flex justify-between items-center py-3">
                          <div>
                            <p className="text-slate-200 font-bold">{sub.clientName}</p>
                            <span className="text-[9.5px] text-slate-500 font-medium">Checked in at {sub.checkInTime}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(sub);
                              setIsCheckingOut(true);
                            }}
                            className="text-[10px] py-1 border-slate-800 hover:border-rose-900 text-rose-400 hover:text-rose-300"
                          >
                            Check-out Member
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-slate-900">
                <CardHeader title="Manual gate checkin helper" description="Search and checkin active memberships" />
                <CardContent>
                  <Button variant="primary" size="sm" onClick={() => setIsCheckingIn(true)} className="w-full text-xs">
                    Open manual portal checkin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance Registry */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search logs by client or ID..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>

            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client</th>
                    <th className="p-3">Log Date</th>
                    <th className="p-3">Check-in Time</th>
                    <th className="p-3">Check-out Time</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedLogs.map(sub => (
                    <tr key={sub.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-bold text-slate-200">{sub.clientName}</td>
                      <td className="p-3 font-mono text-slate-500">{sub.date}</td>
                      <td className="p-3 font-mono">{sub.checkInTime}</td>
                      <td className="p-3 font-mono">{sub.checkOutTime || '-'}</td>
                      <td className="p-3 text-center font-mono text-blue-400">{sub.durationMins ? `${sub.durationMins} mins` : '-'}</td>
                      <td className="p-3">
                        <Badge variant={sub.status === 'present' ? 'emerald' : sub.status === 'late' ? 'warning' : 'rose'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-500">{sub.createdBy}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 text-xs font-semibold">
                        No attendance logs found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalRecords={filteredLogs.length} itemsPerPage={itemsPerPage} />
          </div>
        )}
      </div>

      {/* Manual Check-in Modal */}
      <Dialog isOpen={isCheckingIn} onClose={() => setIsCheckingIn(false)} title="Gate Check-in Desk">
        <form onSubmit={handleCheckInSubmit} className="space-y-4 pt-2 text-left">
          <Input
            label="Client ID Number"
            required
            value={checkinForm.clientId}
            onChange={e => setCheckinForm({ ...checkinForm, clientId: e.target.value })}
            placeholder="CL-001"
          />

          <Input
            label="Check-in Time Stamp"
            type="time"
            required
            value={checkinForm.checkInTime}
            onChange={e => setCheckinForm({ ...checkinForm, checkInTime: e.target.value })}
            className="scheme-dark"
          />

          <Input
            label="Access Remarks"
            value={checkinForm.remarks}
            onChange={e => setCheckinForm({ ...checkinForm, remarks: e.target.value })}
            placeholder="e.g. Card checkin, towel handover"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsCheckingIn(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Check-in Member
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Manual Check-out Modal */}
      {selectedRecord && (
        <Dialog isOpen={isCheckingOut} onClose={() => setIsCheckingOut(false)} title={`Gate Check-out Desk: ${selectedRecord.clientName}`}>
          <form onSubmit={handleCheckOutSubmit} className="space-y-4 pt-2 text-left">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Check-out Time Stamp"
                type="time"
                required
                value={checkoutForm.checkOutTime}
                onChange={e => setCheckoutForm({ ...checkoutForm, checkOutTime: e.target.value })}
                className="scheme-dark"
              />
              <Input
                label="Workout Duration (Mins)"
                type="number"
                required
                value={checkoutForm.durationMins}
                onChange={e => setCheckoutForm({ ...checkoutForm, durationMins: e.target.value })}
              />
            </div>

            <Input
              label="Session Remarks"
              value={checkoutForm.remarks}
              onChange={e => setCheckoutForm({ ...checkoutForm, remarks: e.target.value })}
              placeholder="Completed workout checklist."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button variant="outline" size="sm" onClick={() => setIsCheckingOut(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Check-out Member
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Barcode Scanner Simulation Modal */}
      <Dialog isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Simulate Barcode Scan">
        <div className="space-y-4 text-center py-4">
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Scan a member barcode or QR code at the desk card terminal.
          </p>
          <div className="mx-auto h-24 w-60 border-2 border-dashed border-slate-800 flex items-center justify-center rounded-lg bg-slate-950/40">
            <span className="font-mono text-slate-600 text-xs">[ BARCODE SCANNER ID READY ]</span>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsScannerOpen(false);
                const cls = await clientService.getAll();
                const first = cls[0]?.id || 'CL-001';
                setCheckinForm({ clientId: first, checkInTime: '10:00', remarks: 'QR Scanned checkin' });
                setIsCheckingIn(true);
              }}
              className="text-xs py-1 border-slate-800"
            >
              Simulate Active QR Scan
            </Button>
          </div>
        </div>
      </Dialog>
    </PageLayout>
  );
}

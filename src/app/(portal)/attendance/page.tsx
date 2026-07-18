'use client';

import React, { useState, useMemo } from 'react';
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
import {
  mockAttendanceLogs,
  mockPeakHoursTrend,
  mockSixMonthAttendanceTrend,
  AttendanceRecord
} from '@/mock/attendance';
import { mockClients } from '@/mock/clients';
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

export default function AttendancePage() {
  const { showToast } = useToast();

  // Local State
  const [logs, setLogs] = useState<AttendanceRecord[]>(mockAttendanceLogs);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checkin' | 'logs' | 'calendar' | 'coach'>('dashboard');

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
      const matchSearch =
        l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.clientId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, filterStatus]);

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
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate check-in
    const alreadyInside = logs.some(l => l.clientId === checkinForm.clientId && !l.checkOutTime && l.status === 'present');
    if (alreadyInside) {
      showToast('Client is already checked in and inside the gym.', 'error');
      return;
    }

    const targetClient = mockClients.find(c => c.id === checkinForm.clientId);
    if (!targetClient) return;

    // Check membership validity alert
    if (targetClient.status === 'inactive' || targetClient.status === 'suspended') {
      showToast(`Warning: Client ${targetClient.name} has an INACTIVE/SUSPENDED membership!`, 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsCheckingIn(false);

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
        date: '2026-07-18'
      };

      setLogs([newLog, ...logs]);
      showToast(`${targetClient.name} checked in successfully!`, 'success');
    }, 1200);
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsCheckingOut(false);

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

      setLogs(updatedLogs);
      setSelectedRecord(null);
      showToast('Check-out completed. Workout session logged.', 'success');
    }, 1200);
  };

  const triggerExport = () => {
    showToast('Exporting attendance registry (XLSX format)...', 'info');
    setTimeout(() => {
      showToast('Downloads folder populated.', 'success');
    }, 1200);
  };

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
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Today's Check-ins" value={dashboardStats.checkinsCount} icon={UserCheck} change="Completed entries" />
              <StatCard title="Currently Inside" value={dashboardStats.insideCount} icon={Users} change="Active on gym floor" changeType="increase" />
              <StatCard title="Today's Absentees" value={dashboardStats.absenteesCount} icon={UserX} change="No checkin logged" changeType="neutral" />
              <StatCard title="Average Rate" value={`${dashboardStats.avgDailyRate}%`} icon={TrendingUp} change="Daily client checkin average" changeType="increase" />
            </div>

            {/* Smart Hardware stubs banner */}
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

            {/* Peak Hours Trend Info card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-900">
                <CardHeader title="Today's Peak Hours (Simulated)" description="Visitor density splits across training slots" />
                <CardContent>
                  <div className="space-y-2.5 text-xs font-semibold text-slate-400">
                    {mockPeakHoursTrend.map(pt => (
                      <div key={pt.hour} className="flex items-center gap-3">
                        <span className="w-12 font-mono text-[10px] text-slate-500">{pt.hour}</span>
                        <div className="flex-1 bg-slate-950 rounded h-2 overflow-hidden border border-slate-900/60">
                          <div className="bg-blue-500 h-full rounded" style={{ width: `${(pt.count / 45) * 100}%` }} />
                        </div>
                        <span className="w-8 text-right text-[10px] text-slate-300">{pt.count} checkins</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-900">
                <CardHeader title="Six Month Attendance Average" description="Monthly visitor rate percentages" />
                <CardContent>
                  <div className="space-y-4 text-xs font-semibold text-slate-400 pt-2">
                    {mockSixMonthAttendanceTrend.map(t => (
                      <div key={t.month} className="flex justify-between items-center py-2.5 border-b border-slate-900/60">
                        <span className="text-slate-300 font-bold">{t.month}</span>
                        <span className="text-emerald-400 font-mono">{t.rate}% Rate</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Check-in Desk */}
        {activeTab === 'checkin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fadeIn">
            
            {/* Occupants list */}
            <div className="md:col-span-2 space-y-4">
              <Card className="border-slate-900">
                <CardHeader title="Members Currently Inside Gym" description="Active workout sessions awaiting check-out" />
                <CardContent>
                  {insideMembers.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs py-4 font-semibold">No members checked in currently.</p>
                  ) : (
                    <div className="divide-y divide-slate-900/60 font-semibold text-xs">
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

            {/* Quick Actions / Scanner mockup */}
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

        {/* Tab 3: Attendance Registry logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
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

      {/* OVERLAY DIALOG MODALS */}

      {/* 1. Manual Check-in Modal */}
      <Dialog isOpen={isCheckingIn} onClose={() => setIsCheckingIn(false)} title="Gate Check-in Desk">
        <form onSubmit={handleCheckInSubmit} className="space-y-4 pt-2">
          
          <Select
            label="Select Client Member"
            required
            options={mockClients.map(c => ({ value: c.id, label: `${c.name} (${c.id}) - Status: ${c.status}` }))}
            value={checkinForm.clientId}
            onChange={e => setCheckinForm({ ...checkinForm, clientId: e.target.value })}
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

      {/* 2. Manual Check-out Modal */}
      {selectedRecord && (
        <Dialog isOpen={isCheckingOut} onClose={() => setIsCheckingOut(false)} title={`Gate Check-out Desk: ${selectedRecord.clientName}`}>
          <form onSubmit={handleCheckOutSubmit} className="space-y-4 pt-2">
            
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

      {/* 3. Barcode Scanner Simulation Modal */}
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
              onClick={() => {
                setIsScannerOpen(false);
                setCheckinForm({ clientId: 'CL-001', checkInTime: '10:00', remarks: 'QR Scanned checkin' });
                setIsCheckingIn(true);
              }}
              className="text-xs py-1 border-slate-800"
            >
              Simulate Sarah Jenkins QR Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsScannerOpen(false);
                setCheckinForm({ clientId: 'CL-005', checkInTime: '10:15', remarks: 'Barcode Scanned checkin' });
                setIsCheckingIn(true);
              }}
              className="text-xs py-1 border-slate-800 text-rose-400"
            >
              Simulate Expired Plan QR Scan
            </Button>
          </div>
        </div>
      </Dialog>

    </PageLayout>
  );
}

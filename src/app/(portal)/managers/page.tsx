'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Briefcase, ShieldAlert, Plus, Search, ShieldCheck, UserCheck, UserMinus, Key, Trash2, FileDown, Clock, Shield } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import { staffService, authService, notificationService } from '@/services';
import { Staff } from '@/types';
import { db, UserRecord } from '@/services/db';
import { exportData } from '@/utils/export';

export default function ManagersPage() {
  const { showToast } = useToast();
  const [managers, setManagers] = useState<Staff[]>([]);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal triggers
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null);
  const [showCredsModal, setShowCredsModal] = useState(false);

  // Form states
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specificRole: 'Club Manager',
    salary: '3500'
  });

  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: ''
  });

  const fetchData = async () => {
    try {
      const allStaff = await staffService.getAll();
      setManagers(allStaff.filter(s => s.role === 'manager'));
      setUserRecords(db.getCollection<UserRecord>('gym_users'));
    } catch {
      showToast('Error loading managers roster.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredManagers = useMemo(() => {
    return managers.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
    );
  }, [managers, searchQuery]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerForm.name || !managerForm.email || !managerForm.phone) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user already exists
      const users = db.getCollection<UserRecord>('gym_users');
      if (users.some(u => u.email.toLowerCase() === managerForm.email.toLowerCase())) {
        showToast('A user account with this email address already exists.', 'error');
        setIsLoading(false);
        return;
      }

      // 1. Create Staff profile as manager
      const newStaff: Staff = {
        id: `MGR-${String(Date.now()).slice(-3)}`,
        name: managerForm.name,
        email: managerForm.email,
        phone: managerForm.phone,
        role: 'manager',
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        salary: parseFloat(managerForm.salary)
      };

      await staffService.create(newStaff);

      // 2. Create User login credentials
      const cleanName = managerForm.name.toLowerCase().replace(/[^a-z]/g, '');
      const tempPass = `${cleanName}@mgr123`;
      await authService.createUserAccount(managerForm.email, tempPass, 'manager', newStaff.id);

      // Create Notification
      await notificationService.create({
        title: 'New Manager Registered',
        message: `${managerForm.name} has been added as a ${managerForm.specificRole}.`,
        type: 'success',
        targetRole: 'super_admin'
      });

      setGeneratedCreds({ email: managerForm.email, pass: tempPass });
      setIsAdding(false);
      setShowCredsModal(true);
      
      // Reset form
      setManagerForm({
        name: '',
        email: '',
        phone: '',
        specificRole: 'Club Manager',
        salary: '3500'
      });
      
      fetchData();
      showToast('Manager account registered successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error registering manager.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async (email: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await authService.suspendUser(email);
        showToast('Manager login suspended.', 'success');
      } else {
        await authService.activateUser(email);
        showToast('Manager login activated.', 'success');
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error editing user status.', 'error');
    }
  };

  const handleDeleteManager = async (staffId: string, email: string) => {
    try {
      await staffService.delete(staffId);
      
      // Remove credentials
      const users = db.getCollection<UserRecord>('gym_users');
      const updatedUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
      db.saveCollection('gym_users', updatedUsers);

      showToast('Manager records deleted.', 'success');
      fetchData();
    } catch {
      showToast('Deletion failed.', 'error');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.email || !resetForm.newPassword) {
      showToast('All fields required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetForm.email, resetForm.newPassword);
      showToast('Manager credential reset completed.', 'success');
      setIsResetting(false);
      setResetForm({ email: '', newPassword: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Reset failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredManagers.length === 0) {
      showToast('No data available to export.', 'error');
      return;
    }

    const headers = ['Manager ID', 'Full Name', 'Email Address', 'Phone Number', 'Salary ($)', 'Status', 'Date Hired'];
    const rows = filteredManagers.map(m => [
      m.id,
      m.name,
      m.email,
      m.phone,
      m.salary,
      m.status,
      m.hireDate
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Managers_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting to CSV initiated.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting to Excel initiated.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Managers Operational Roster', headers, rows, filename);
      showToast('Exporting to PDF print initiated.', 'success');
    }
  };

  return (
    <PageLayout
      title="Manager Personnel Registry"
      description="Manage operations coordinators, branch directors, and operational managers."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetting(true)}
            className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-400 hover:text-white"
          >
            <Key className="h-4 w-4" /> Reset Password
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Register Manager
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2 text-left">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Active Managers" value={managers.length} icon={Shield} change="Authorized operational roles" />
          <StatCard title="Suspended Credentials" value={userRecords.filter(u => u.role === 'manager' && u.status === 'suspended').length} icon={ShieldAlert} change="Clearances revoked" changeType="decrease" />
          <StatCard title="Monthly Salary Ledger" value={`$${managers.reduce((acc, m) => acc + m.salary, 0).toLocaleString()}`} icon={Briefcase} change="Personnel payroll budget" changeType="increase" />
        </div>

        {/* Filters and Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search managers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
            />
          </div>

          <div className="flex gap-2 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              className="text-xs py-1.5 px-3! flex items-center gap-1 border-slate-800 text-slate-400 hover:text-white"
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('xlsx')}
              className="text-xs py-1.5 px-3! flex items-center gap-1 border-slate-800 text-slate-400 hover:text-white"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="text-xs py-1.5 px-3! flex items-center gap-1 border-slate-800 text-slate-400 hover:text-white"
            >
              CSV
            </Button>
          </div>
        </div>

        {/* Manager Database List */}
        <Card className="border-slate-900">
          <CardHeader title="Club Managers Directory" description="Roster database of managers with operations control clearance." />
          <CardContent className="p-0">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Manager ID</th>
                    <th className="p-3">Full Name / Contact</th>
                    <th className="p-3">Access Level</th>
                    <th className="p-3 font-mono">Monthly Salary</th>
                    <th className="p-3">Credentials status</th>
                    <th className="p-3 text-right">Clearance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredManagers.map(mgr => {
                    const linkedUser = userRecords.find(u => u.email.toLowerCase() === mgr.email.toLowerCase());
                    const loginStatus = linkedUser ? linkedUser.status : 'inactive';

                    return (
                      <tr key={mgr.id} className="table-row-hover text-slate-300">
                        <td className="p-3 font-mono text-slate-500">{mgr.id}</td>
                        <td className="p-3">
                          <div>
                            <p className="font-bold text-slate-200">{mgr.name}</p>
                            <span className="text-[9.5px] text-slate-500 font-mono block">{mgr.email} • {mgr.phone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="blue">operations manager</Badge>
                        </td>
                        <td className="p-3 font-mono text-slate-200">${mgr.salary}</td>
                        <td className="p-3">
                          <Badge variant={loginStatus === 'active' ? 'emerald' : 'rose'}>{loginStatus}</Badge>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendToggle(mgr.email, loginStatus)}
                            className="text-[10px] py-1 border-slate-800 hover:text-white"
                          >
                            {loginStatus === 'active' ? (
                              <span className="flex items-center gap-1"><UserMinus className="h-3 w-3 text-yellow-500" /> Suspend</span>
                            ) : (
                              <span className="flex items-center gap-1"><UserCheck className="h-3 w-3 text-emerald-500" /> Activate</span>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteManager(mgr.id, mgr.email)}
                            className="text-[10px] py-1 border-slate-800 text-rose-500 hover:bg-rose-500/5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredManagers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No managers registered in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 1. Register Manager Modal */}
      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Register Operations Manager">
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={managerForm.name}
            onChange={e => setManagerForm({ ...managerForm, name: e.target.value })}
            placeholder="Alex Pierce"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={managerForm.email}
              onChange={e => setManagerForm({ ...managerForm, email: e.target.value })}
              placeholder="alex@thegymfitnesshub.in"
            />
            <Input
              label="Phone Number"
              required
              value={managerForm.phone}
              onChange={e => setManagerForm({ ...managerForm, phone: e.target.value })}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Manager Role Assignment"
              options={[
                { value: 'Club Manager', label: 'Club Manager (RBAC Clearance)' },
                { value: 'Operations Manager', label: 'Operations Manager (Floor operations)' },
                { value: 'Assistant Manager', label: 'Assistant Manager (Admin tasks)' },
                { value: 'Reception Manager', label: 'Reception Manager (Check-ins management)' }
              ]}
              value={managerForm.specificRole}
              onChange={e => setManagerForm({ ...managerForm, specificRole: e.target.value })}
            />
            <Input
              label="Monthly Salary ($)"
              type="number"
              value={managerForm.salary}
              onChange={e => setManagerForm({ ...managerForm, salary: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Save & Register
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Reset Password Modal */}
      <Dialog isOpen={isResetting} onClose={() => setIsResetting(false)} title="Reset Manager Password">
        <form onSubmit={handlePasswordResetSubmit} className="space-y-4 pt-2">
          <Input
            label="Manager Email Address"
            type="email"
            required
            value={resetForm.email}
            onChange={e => setResetForm({ ...resetForm, email: e.target.value })}
            placeholder="manager@thegymfitnesshub.in"
          />
          <Input
            label="New Access Password"
            type="password"
            required
            value={resetForm.newPassword}
            onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })}
            placeholder="Minimum 6 characters"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsResetting(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Reset Access Credentials
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Credentials Success Modal */}
      <Dialog isOpen={showCredsModal} onClose={() => setShowCredsModal(false)} title="Manager Account Registered">
        {generatedCreds && (
          <div className="space-y-4 pt-2 text-left text-xs font-semibold">
            <p className="text-slate-300">
              The operations manager profile has been successfully created. Temporary user login credentials:
            </p>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-2.5 font-mono text-[10.5px]">
              <p><strong className="text-slate-500">Email:</strong> <span className="text-slate-200">{generatedCreds.email}</span></p>
              <p><strong className="text-slate-500">Password:</strong> <span className="text-emerald-400">{generatedCreds.pass}</span></p>
            </div>
            <p className="text-[10px] text-slate-500">
              Please share these credentials with the manager securely. They will be forced to update the password on first login.
            </p>
            <div className="flex justify-end pt-2 border-t border-slate-900">
              <Button variant="primary" size="sm" onClick={() => setShowCredsModal(false)} className="text-xs px-4!">
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </PageLayout>
  );
}

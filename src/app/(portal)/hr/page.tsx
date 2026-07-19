'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Search, UserCheck, UserMinus, ShieldAlert, Key, Edit, Briefcase } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import { staffService, authService } from '@/services';
import { Staff } from '@/types';
import { db, UserRecord } from '@/services/db';

export default function HRPage() {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal triggers
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Form states
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist' as Staff['role'],
    salary: '2000'
  });
  
  const [resetForm, setResetForm] = useState({
    email: '',
    newPassword: ''
  });

  const fetchData = async () => {
    try {
      const list = await staffService.getAll();
      setStaffList(list);
      setUserRecords(db.getCollection<UserRecord>('gym_users'));
    } catch {
      showToast('Error loading staff roster.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Staff profile
      const newStaff: Staff = {
        id: `STF-${String(staffList.length + 1).padStart(3, '0')}`,
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        role: staffForm.role,
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        salary: parseFloat(staffForm.salary)
      };

      await staffService.create(newStaff);

      // 2. Create User login credentials
      const tempPass = `${staffForm.name.toLowerCase().replace(/ /g, '')}@123`;
      await authService.createUserAccount(staffForm.email, tempPass, staffForm.role === 'manager' ? 'manager' : 'coach', newStaff.id);

      showToast(`Staff registered! Temporary password: ${tempPass}`, 'success');
      setIsAdding(false);
      setStaffForm({
        name: '',
        email: '',
        phone: '',
        role: 'receptionist',
        salary: '2000'
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error registering staff.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendToggle = async (email: string, currentStatus: string) => {
    try {
      if (email === 'gowtham@thegymfitnesshub.in') {
        showToast('Super Admin credentials cannot be suspended.', 'error');
        return;
      }
      
      if (currentStatus === 'active') {
        await authService.suspendUser(email);
        showToast('User login suspended.', 'success');
      } else {
        await authService.activateUser(email);
        showToast('User login activated.', 'success');
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error editing user status.', 'error');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.email || !resetForm.newPassword) {
      showToast('All fields required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetForm.email, resetForm.newPassword);
      showToast('Credential reset completed successfully.', 'success');
      setIsResetting(false);
      setResetForm({ email: '', newPassword: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Reset failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="HR & Access Management"
      description="Manage administrative staff, configure operational privileges, and suspend or restore accounts."
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
            <Plus className="h-4 w-4" /> Register Staff
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Administrative Staff" value={staffList.length} icon={Briefcase} change="Total active workers" />
          <StatCard title="Active User Accounts" value={userRecords.filter(u => u.status === 'active').length} icon={ShieldCheck} change="Credentials verified" />
          <StatCard title="Suspended Users" value={userRecords.filter(u => u.status === 'suspended').length} icon={ShieldAlert} change="Clearance revoked" />
        </div>

        {/* Staff Registry Table */}
        <Card className="border-slate-900">
          <CardHeader title="Club Personnel Registry" description="Roster database of operations, managers, and receptionists." />
          <CardContent className="p-0">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Full Name / Contact</th>
                    <th className="p-3">Administrative Role</th>
                    <th className="p-3 font-mono">Monthly Salary</th>
                    <th className="p-3">Access Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {staffList.map(staff => {
                    const linkedUser = userRecords.find(u => u.email.toLowerCase() === staff.email.toLowerCase());
                    const loginStatus = linkedUser ? linkedUser.status : 'inactive';
                    
                    return (
                      <tr key={staff.id} className="table-row-hover text-slate-300">
                        <td className="p-3 font-mono text-[10.5px] text-slate-500">{staff.id}</td>
                        <td className="p-3">
                          <div>
                            <p className="font-bold text-slate-200">{staff.name}</p>
                            <span className="text-[9.5px] text-slate-500 font-semibold">{staff.email} • {staff.phone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={staff.role === 'manager' ? 'blue' : 'slate'}>{staff.role}</Badge>
                        </td>
                        <td className="p-3 font-mono text-emerald-500">${staff.salary}</td>
                        <td className="p-3">
                          <Badge variant={loginStatus === 'active' ? 'emerald' : 'rose'}>{loginStatus}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendToggle(staff.email, loginStatus)}
                            className={`text-[10px] py-1 border-slate-800 ${
                              loginStatus === 'active' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                            }`}
                          >
                            {loginStatus === 'active' ? 'Suspend Access' : 'Restore Access'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OVERLAY DIALOGS */}
      
      {/* 1. Register Staff Modal */}
      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Register Operations Staff">
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={staffForm.name}
            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
            placeholder="Clara Oswald"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={staffForm.email}
              onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
              placeholder="clara@thegymfitnesshub.in"
            />
            <Input
              label="Phone Number"
              required
              value={staffForm.phone}
              onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
              placeholder="+1 (555) 019-8803"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Administrative Role"
              options={[
                { value: 'manager', label: 'Club Manager (RBAC Clearance)' },
                { value: 'receptionist', label: 'Receptionist' },
                { value: 'admin', label: 'General Admin' }
              ]}
              value={staffForm.role}
              onChange={e => setStaffForm({ ...staffForm, role: e.target.value as any })}
            />
            <Input
              label="Monthly Salary ($)"
              type="number"
              value={staffForm.salary}
              onChange={e => setStaffForm({ ...staffForm, salary: e.target.value })}
            />
          </div>

          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Note: Registering staff automatically creates a user login account with a temporary password based on the staff's name (e.g. <code>claraoswald@123</code>).
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Save Staff File
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Reset Password Modal */}
      <Dialog isOpen={isResetting} onClose={() => setIsResetting(false)} title="Force Password Reset">
        <form onSubmit={handlePasswordReset} className="space-y-4 pt-2">
          <Input
            label="Staff Login Email"
            type="email"
            required
            value={resetForm.email}
            onChange={e => setResetForm({ ...resetForm, email: e.target.value })}
            placeholder="name@thegymfitnesshub.in"
          />
          <Input
            label="New Access Password"
            type="password"
            required
            value={resetForm.newPassword}
            onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })}
            placeholder="••••••••"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsResetting(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Reset Credentials
            </Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

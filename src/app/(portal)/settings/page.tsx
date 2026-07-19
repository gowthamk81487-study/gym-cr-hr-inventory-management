'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Lock, Eye, CheckCircle, ShieldAlert, Sparkles, Building } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { authService } from '@/services';
import { UserRecord } from '@/services/db';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  
  // Password form states
  const [passwords, setPasswords] = useState({ old: '', newPassword: '', confirm: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // System config states (Simulate updates in local state)
  const [features, setFeatures] = useState({
    enableStripeBilling: true,
    enableNFCScanner: false,
    enableRealtimeAlerts: true
  });
  const [branches, setBranches] = useState({
    downtown: true,
    heights: true,
    marina: false
  });

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.old || !passwords.newPassword || !passwords.confirm) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword(passwords.old, passwords.newPassword);
      showToast('Password updated successfully!', 'success');
      setPasswords({ old: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      showToast(err.message || 'Error updating password.', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleFeatureToggle = (key: keyof typeof features) => {
    if (currentUser?.role !== 'super_admin') {
      showToast('Only Super Admin can edit configuration gates.', 'error');
      return;
    }
    setFeatures(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast('System configuration gate updated.', 'success');
      return next;
    });
  };

  const handleBranchToggle = (key: keyof typeof branches) => {
    if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'manager') {
      showToast('Access Denied. Insufficient permissions.', 'error');
      return;
    }
    setBranches(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast(`Branch operational status updated.`, 'success');
      return next;
    });
  };

  return (
    <PageLayout
      title="System Settings"
      description="Manage branch allocations, configuration gates, and personal security profiles."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
        {/* Left Column: Password Management (Accessible to Everyone) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-900">
            <CardHeader
              title="Change Password"
              description="Secure your session by authenticating old and confirming new credentials."
              action={
                <div className="h-7 w-7 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center text-slate-500 shadow-inner">
                  <Lock className="h-4 w-4" />
                </div>
              }
            />
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Old Password"
                  type="password"
                  required
                  value={passwords.old}
                  onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={passwords.newPassword}
                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2">
                  <Button variant="primary" size="sm" type="submit" isLoading={isChangingPass} className="text-xs px-4!">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Branch Allocations (Manager/Super Admin) */}
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'manager') && (
            <Card className="border-slate-900">
              <CardHeader
                title="Branch Allocations"
                description="Toggle operational clearance gates for physical gym outlets."
                action={
                  <div className="h-7 w-7 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center text-slate-500 shadow-inner">
                    <Building className="h-4 w-4" />
                  </div>
                }
              />
              <CardContent className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  <div>
                    <h5 className="font-bold text-slate-300">The Gym Fitness Club Downtown Club</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Primary HQ • Olympic cages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={branches.downtown}
                      onChange={() => handleBranchToggle('downtown')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  <div>
                    <h5 className="font-bold text-slate-300">The Gym Fitness Club Heights Club</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cardio suites & wellness zone</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={branches.heights}
                      onChange={() => handleBranchToggle('heights')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  <div>
                    <h5 className="font-bold text-slate-300">The Gym Fitness Club Marina Club</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Cryotherapy & recovery suite</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={branches.marina}
                      onChange={() => handleBranchToggle('marina')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Roles & Feature Clearance */}
        <div className="space-y-6">
          <Card className="border-slate-900">
            <CardHeader title="Role Clearance Profile" description="Your authenticated credentials overview." />
            <CardContent className="space-y-3 text-xs font-semibold">
              <div className="bg-slate-950/60 p-3 border border-slate-900 rounded-lg">
                <span className="text-slate-500 uppercase text-[8px] tracking-wider block">Logged In As</span>
                <span className="text-slate-200 font-bold block mt-1">{currentUser?.email}</span>
              </div>
              <div className="bg-slate-950/60 p-3 border border-slate-900 rounded-lg">
                <span className="text-slate-500 uppercase text-[8px] tracking-wider block">Access Role</span>
                <span className="text-blue-400 font-bold block mt-1 uppercase tracking-wider">{currentUser?.role.replace('_', ' ')}</span>
              </div>
              <div className="bg-slate-950/60 p-3 border border-slate-900 rounded-lg">
                <span className="text-slate-500 uppercase text-[8px] tracking-wider block">Account Status</span>
                <span className="text-emerald-400 font-bold block mt-1 uppercase">Operational ({currentUser?.status})</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Configuration Gates (Super Admin Only) */}
          {currentUser?.role === 'super_admin' && (
            <Card className="border-slate-900 border-blue-500/10">
              <CardHeader
                title="System Gates"
                description="SaaS framework feature flags configuration."
                action={
                  <div className="h-7 w-7 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                }
              />
              <CardContent className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-300">Stripe Billing Integration</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recurring membership cards</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={features.enableStripeBilling}
                      onChange={() => handleFeatureToggle('enableStripeBilling')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-300">Hardware NFC Card Scanner</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Gate check-in RFID</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={features.enableNFCScanner}
                      onChange={() => handleFeatureToggle('enableNFCScanner')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-300">Real-time Admin WebSockets</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Immediate occupancy feeds</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={features.enableRealtimeAlerts}
                      onChange={() => handleFeatureToggle('enableRealtimeAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

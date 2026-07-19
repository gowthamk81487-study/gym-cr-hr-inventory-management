'use client';

import React, { useEffect, useState } from 'react';
import { Dumbbell, Search, Plus, Mail, Phone, Clock, Award, Star } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { coachService, authService } from '@/services';
import { Coach, Client } from '@/types';
import { db } from '@/services/db';
import { exportData } from '@/utils/export';

export default function CoachesPage() {
  const { showToast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Coach specific states
  const [coachTab, setCoachTab] = useState<'assigned' | 'pool'>('assigned');
  const [selectedPoolClient, setSelectedPoolClient] = useState<Client | null>(null);
  const [selectedPtPackage, setSelectedPtPackage] = useState<string>('pt-1month');
  const [claimingClient, setClaimingClient] = useState(false);
  
  // Modal states
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [coachForm, setCoachForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    experienceYears: '5'
  });

  const fetchData = async () => {
    try {
      const list = await coachService.getAll();
      setCoaches(list);
    } catch {
      showToast('Error loading coaches roster.', 'error');
    }
  };

  useEffect(() => {
    const cur = authService.getCurrentUser();
    setCurrentUser(cur);
    if (cur) {
      setRole(cur.role);
    }
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachForm.name || !coachForm.email || !coachForm.specialization) {
      showToast('All fields are required.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newCoach: Coach = {
        id: `coach-${coaches.length + 1}`,
        name: coachForm.name,
        email: coachForm.email,
        phone: coachForm.phone,
        specialization: coachForm.specialization,
        role: 'personal_trainer',
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
        activeClientsCount: 0,
        bio: coachForm.bio || 'Accredited physical trainer.',
        experienceYears: parseInt(coachForm.experienceYears, 10),
        profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
      };

      await coachService.create(newCoach);
      
      // Auto create user account
      const tempPass = `${coachForm.name.toLowerCase().replace(/ /g, '')}@123`;
      await authService.createUserAccount(coachForm.email, tempPass, 'coach', newCoach.id);

      showToast(`Coach registered! Temporary password: ${tempPass}`, 'success');
      setIsAdding(false);
      setCoachForm({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        bio: '',
        experienceYears: '5'
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error adding coach.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Client View of their assigned Coach
  if (role === 'client') {
    const clients = db.getCollection<Client>('gym_clients');
    const myClient = clients.find(c => c.email.toLowerCase() === currentUser?.email.toLowerCase());
    const assignedCoach = coaches.find(co => co.id === myClient?.coachId);

    return (
      <PageLayout title="My Personal Coach" description="Interact with your assigned personal trainer or nutritionist.">
        <div className="max-w-2xl mx-auto py-4">
          {assignedCoach ? (
            <Card className="border-slate-900 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <CardContent className="pt-6 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-900 pb-5">
                  <Avatar name={assignedCoach.name} src={assignedCoach.profilePic} size="lg" />
                  <div className="space-y-1.5 text-center sm:text-left">
                    <h3 className="text-lg font-black text-slate-100">{assignedCoach.name}</h3>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2.5 py-0.5 rounded border border-blue-500/10 block w-fit mx-auto sm:mx-0">
                      {assignedCoach.specialization}
                    </span>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>{assignedCoach.experienceYears} Years Certified Experience</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-slate-300">
                  <h4 className="text-slate-400 uppercase tracking-wider text-[10px]">Coach Biography</h4>
                  <p className="leading-relaxed text-slate-300 font-medium bg-slate-900/10 p-3.5 border border-slate-900 rounded-lg">
                    "{assignedCoach.bio}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-950">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4.5 w-4.5 text-slate-500" />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Email Address</span>
                        <span>{assignedCoach.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4.5 w-4.5 text-slate-500" />
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Phone Number</span>
                        <span>{assignedCoach.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-900">
              <CardContent className="py-10 text-center space-y-4">
                <Dumbbell className="h-10 w-10 text-slate-600 animate-bounce mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">No Coach Assigned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your profile has not been assigned a personal coach. Contact the reception desk or manager to match a trainer.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    );
  }

  // 2. Coach View of their Own Profile
  if (role === 'coach') {
    const myCoach = coaches.find(co => co.email.toLowerCase() === currentUser?.email.toLowerCase());
    const myClients = db.getCollection<Client>('gym_clients').filter(c => c.coachId === myCoach?.id);

    // Compute Pool Clients (Active status, no coachId, and within 7 days of completing PR starter program)
    const today = new Date();
    const poolClients = db.getCollection<Client>('gym_clients').filter(c => {
      if (c.status !== 'active') return false;
      if (c.coachId) return false;
      if (c.prCompletedDate) {
        const compDate = new Date(c.prCompletedDate);
        const diffTime = today.getTime() - compDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        if (diffDays > 7) {
          return false; // automatically removed from pool after 7 days
        }
      }
      return true;
    });

    const handleClaimSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPoolClient || !myCoach) return;

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setClaimingClient(false);

        // 1. Update client record with coach details and PT plan
        const allClients = db.getCollection<Client>('gym_clients');
        const clientIdx = allClients.findIndex(c => c.id === selectedPoolClient.id);
        if (clientIdx !== -1) {
          allClients[clientIdx].coachId = myCoach.id;
          allClients[clientIdx].ptPackage = selectedPtPackage;
          allClients[clientIdx].renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          db.saveCollection('gym_clients', allClients);
        }

        // 2. Update coach active client counter
        const allCoaches = db.getCollection<Coach>('gym_coaches');
        const coachIdx = allCoaches.findIndex(co => co.id === myCoach.id);
        if (coachIdx !== -1) {
          allCoaches[coachIdx].activeClientsCount = (allCoaches[coachIdx].activeClientsCount || 0) + 1;
          db.saveCollection('gym_coaches', allCoaches);
        }

        // 3. Trigger alert notification for client
        const notifications = db.getCollection<any>('gym_notifications');
        notifications.push({
          id: `NOT-${Date.now()}`,
          title: 'Coach Assigned & PT Prescribed',
          message: `Trainer ${myCoach.name} accepted your profile and prescribed the ${selectedPtPackage === 'pt-1month' ? '1-Month' : selectedPtPackage === 'pt-3month' ? '3-Month' : selectedPtPackage === 'pt-6month' ? '6-Month' : '12-Month'} PT Package.`,
          type: 'success',
          read: false,
          date: new Date().toISOString(),
          targetUserId: selectedPoolClient.email
        });
        db.saveCollection('gym_notifications', notifications);

        showToast(`Client ${selectedPoolClient.name} successfully claimed and assigned to your roster!`, 'success');
        setSelectedPoolClient(null);
        fetchData();
      }, 1000);
    };

    return (
      <PageLayout title="My Coach Profile" description="Overview of your fitness credentials, biography details, and clients list.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
          {myCoach ? (
            <>
              {/* Profile Card */}
              <Card className="border-slate-900">
                <CardContent className="pt-6 space-y-6 text-left">
                  <div className="text-center space-y-3">
                    <Avatar name={myCoach.name} src={myCoach.profilePic} size="lg" className="mx-auto" />
                    <div>
                      <h3 className="text-base font-black text-slate-100">{myCoach.name}</h3>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 inline-block mt-1">
                        {myCoach.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-slate-300 border-t border-slate-900 pt-4">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block mb-1">Biography</span>
                      <p className="p-3 bg-slate-950/40 rounded border border-slate-900/60 leading-relaxed font-medium">
                        {myCoach.bio}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <p className="flex justify-between">
                        <span className="text-slate-500">Contact:</span>
                        <span>{myCoach.phone}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500">Experience:</span>
                        <span>{myCoach.experienceYears} Years Certified</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roster & Pool Tabbed Layout */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
                  <button
                    onClick={() => setCoachTab('assigned')}
                    className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                      coachTab === 'assigned'
                        ? 'border-blue-500 text-slate-100'
                        : 'border-transparent hover:text-slate-300'
                    }`}
                  >
                    Assigned Clients ({myClients.length})
                  </button>
                  <button
                    onClick={() => setCoachTab('pool')}
                    className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                      coachTab === 'pool'
                        ? 'border-blue-500 text-slate-100'
                        : 'border-transparent hover:text-slate-300'
                    }`}
                  >
                    Available PT Client Pool ({poolClients.length})
                  </button>
                </div>

                {coachTab === 'assigned' ? (
                  <Card className="border-slate-900">
                    <CardHeader title="My Assigned Clients" description="Roster database of gym members assigned to you." />
                    <CardContent className="p-0">
                      <div className="table-container text-[11px] font-semibold text-slate-400">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                              <th className="p-3">Client</th>
                              <th className="p-3">Phone</th>
                              <th className="p-3">Fitness Goal</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {myClients.map(c => (
                              <tr key={c.id} className="table-row-hover text-slate-300">
                                <td className="p-3">
                                  <div>
                                    <p className="font-bold text-slate-200">{c.name}</p>
                                    <span className="text-[9.5px] text-slate-500 font-semibold">{c.email}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono">{c.phone}</td>
                                <td className="p-3 uppercase text-[9px] text-blue-400">{c.fitnessGoal.replace('_', ' ')}</td>
                                <td className="p-3">
                                  <Badge variant={c.status === 'active' ? 'emerald' : 'rose'}>{c.status}</Badge>
                                </td>
                              </tr>
                            ))}
                            {myClients.length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-slate-500">
                                  No clients assigned to your profile yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-900">
                    <CardHeader title="Available PT Client Pool" description="Browse active clients looking for a personal coach. Claim and assign a PT package." />
                    <CardContent className="p-0">
                      <div className="table-container text-[11px] font-semibold text-slate-400">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                              <th className="p-3">Client</th>
                              <th className="p-3">Fitness Goal</th>
                              <th className="p-3">PR Completion Date</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {poolClients.map(c => (
                              <tr key={c.id} className="table-row-hover text-slate-300">
                                <td className="p-3">
                                  <div>
                                    <p className="font-bold text-slate-200">{c.name}</p>
                                    <span className="text-[9.5px] text-slate-500 font-semibold">{c.email}</span>
                                  </div>
                                </td>
                                <td className="p-3 uppercase text-[9px] text-blue-400">{c.fitnessGoal.replace('_', ' ')}</td>
                                <td className="p-3 font-mono">{c.prCompletedDate || 'Completed recently'}</td>
                                <td className="p-3 text-right">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPoolClient(c);
                                      setClaimingClient(true);
                                    }}
                                    className="text-[10px] py-1 px-3! bg-blue-600 hover:bg-blue-500 font-bold"
                                  >
                                    Accept Client
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            {poolClients.length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-slate-500">
                                  Available Client Pool is empty. No clients are currently waiting for a coach.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Accept & PT Assignment Dialog */}
              <Dialog isOpen={claimingClient} onClose={() => setClaimingClient(false)} title="Accept Client & Prescribe PT Package">
                {selectedPoolClient && (
                  <form onSubmit={handleClaimSubmit} className="space-y-4 pt-2">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 space-y-2 text-left text-xs text-slate-300">
                      <p><strong className="text-slate-200">Client Name:</strong> {selectedPoolClient.name}</p>
                      <p><strong className="text-slate-200">Client Goal:</strong> <span className="uppercase text-blue-400">{selectedPoolClient.fitnessGoal.replace('_', ' ')}</span></p>
                      <p><strong className="text-slate-200">Enrolled Email:</strong> {selectedPoolClient.email}</p>
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select PT Tariff Tier</label>
                      <select
                        value={selectedPtPackage}
                        onChange={e => setSelectedPtPackage(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 font-semibold"
                      >
                        <option value="pt-1month">1-Month Personal Training Roster ($150)</option>
                        <option value="pt-3month">3-Month Personal Training Roster ($400)</option>
                        <option value="pt-6month">6-Month Personal Training Roster ($750)</option>
                        <option value="pt-12month">12-Month Personal Training Roster ($1200)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                      <Button variant="outline" size="sm" onClick={() => setClaimingClient(false)} disabled={isLoading} className="text-xs">
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                        Assign & Accept
                      </Button>
                    </div>
                  </form>
                )}
              </Dialog>
            </>
          ) : (
            <div className="col-span-3 text-center py-10">Coach file not initialized.</div>
          )}
        </div>
      </PageLayout>
    );
  }

  // 3. Admin / Manager View (Full list of coaches)
  const filteredCoaches = coaches.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCoaches = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredCoaches.length === 0) {
      showToast('No coach data to export.', 'error');
      return;
    }

    const headers = ['Coach ID', 'Full Name', 'Email', 'Phone', 'Specialization', 'Years of Experience', 'Active Clients'];
    const rows = filteredCoaches.map(co => [
      co.id,
      co.name,
      co.email,
      co.phone,
      co.specialization,
      co.experienceYears,
      co.activeClientsCount
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Coaches_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting coaches to CSV.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting coaches to Excel.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Fitness Coaches Roster Directory', headers, rows, filename);
      showToast('Exporting coaches to PDF print.', 'success');
    }
  };

  return (
    <PageLayout
      title="Coach CRM Registry"
      description="Roster database of personal fitness coaches, athletic conditioners, and nutritionists."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          <Plus className="h-4 w-4" /> Register Coach
        </Button>
      }
    >
      <div className="space-y-6 py-2">
        {/* Search & Export */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search coaches by name or specialization..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
            />
          </div>
          <div className="flex gap-2 self-stretch sm:self-auto justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExportCoaches('pdf')} className="text-xs border-slate-850 hover:text-white">PDF</Button>
            <Button variant="outline" size="sm" onClick={() => handleExportCoaches('xlsx')} className="text-xs border-slate-850 hover:text-white">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExportCoaches('csv')} className="text-xs border-slate-850 hover:text-white">CSV</Button>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCoaches.map(co => (
            <Card key={co.id} className="border-slate-900 text-left flex flex-col justify-between relative group">
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-4 items-start">
                  <Avatar name={co.name} src={co.profilePic} size="md" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">{co.name}</h4>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 block w-fit">
                      {co.specialization}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-semibold leading-relaxed line-clamp-2">
                  {co.bio || 'Club certified personal trainer.'}
                </p>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-950 pt-3 text-[10px] text-slate-400 font-bold text-center">
                  <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Experience</span>
                    <span>{co.experienceYears} Years</span>
                  </div>
                  <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Clients</span>
                    <span>{co.activeClientsCount} active</span>
                  </div>
                  <div className="bg-slate-950/40 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Status</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Register Coach Modal */}
      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Register Gym Coach">
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={coachForm.name}
            onChange={e => setCoachForm({ ...coachForm, name: e.target.value })}
            placeholder="Coach Marcus Sterling"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={coachForm.email}
              onChange={e => setCoachForm({ ...coachForm, email: e.target.value })}
              placeholder="marcus@thegymfitnesshub.in"
            />
            <Input
              label="Phone Number"
              value={coachForm.phone}
              onChange={e => setCoachForm({ ...coachForm, phone: e.target.value })}
              placeholder="+1 (555) 019-1111"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialization"
              required
              value={coachForm.specialization}
              onChange={e => setCoachForm({ ...coachForm, specialization: e.target.value })}
              placeholder="Barbell Strength & CrossFit"
            />
            <Input
              label="Years of Experience"
              type="number"
              value={coachForm.experienceYears}
              onChange={e => setCoachForm({ ...coachForm, experienceYears: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Biography & Description</label>
            <textarea
              rows={3}
              value={coachForm.bio}
              onChange={e => setCoachForm({ ...coachForm, bio: e.target.value })}
              placeholder="Brief details regarding certification, sports history, or coaching achievements..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
              Save Coach Profile
            </Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

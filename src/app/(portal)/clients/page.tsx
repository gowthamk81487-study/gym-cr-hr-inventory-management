'use client';

import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Activity,
  CreditCard,
  UserCheck,
  Briefcase,
  AlertTriangle,
  X,
  FileDown,
  FileUp,
  TrendingUp,
  Dumbbell,
  ShieldAlert,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { mockClients, mockCoaches } from '@/mock/clients';
import { mockMemberships } from '@/mock/data';
import { Client, Coach } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { FormWrapper } from '@/components/form/FormWrapper';
import FormField from '@/components/form/FormField';
import PageLayout from '@/layouts/PageLayout';
import { Dropdown } from '@/components/ui/Dropdown';
import { Pagination } from '@/components/ui/Pagination';

// 1. Zod Form Validation Schema
const clientValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone must be at least 5 digits'),
  membershipId: z.string().min(1, 'Please select a membership plan'),
  coachId: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  gender: z.enum(['male', 'female', 'other']),
  age: z.coerce.number().min(10, 'Must be at least 10 years old').max(100),
  dob: z.string().min(1, 'Date of birth is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(5, 'Emergency contact phone is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  fitnessGoal: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'general_health']),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientValidationSchema>;

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  
  // Roster parameters
  const coaches = mockCoaches;
  const memberships = mockMemberships;

  // Filter States
  const [search, setSearch] = useState('');
  const [filterMembership, setFilterMembership] = useState('all');
  const [filterCoach, setFilterCoach] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterGoal, setFilterGoal] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Overlay states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'membership' | 'metrics' | 'payments' | 'ai'>('overview');

  // Computed statistics
  const statsSummary = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const atRisk = clients.filter(c => c.status === 'suspended' || c.paymentStatus === 'overdue').length;
    const pending = clients.filter(c => c.status === 'pending').length;
    return { total, active, atRisk, pending };
  }, [clients]);

  // Filters logic
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.id.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.includes(search);
      
      const matchMembership = filterMembership === 'all' || client.membershipId === filterMembership;
      const matchCoach = filterCoach === 'all' || client.coachId === filterCoach;
      const matchGender = filterGender === 'all' || client.gender === filterGender;
      const matchGoal = filterGoal === 'all' || client.fitnessGoal === filterGoal;
      const matchStatus = filterStatus === 'all' || client.status === filterStatus;
      const matchPayment = filterPayment === 'all' || client.paymentStatus === filterPayment;

      return matchSearch && matchMembership && matchCoach && matchGender && matchGoal && matchStatus && matchPayment;
    });
  }, [clients, search, filterMembership, filterCoach, filterGender, filterGoal, filterStatus, filterPayment]);

  // Paginated slices
  const paginatedClients = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const resetFilters = () => {
    setSearch('');
    setFilterMembership('all');
    setFilterCoach('all');
    setFilterGender('all');
    setFilterGoal('all');
    setFilterStatus('all');
    setFilterPayment('all');
    setCurrentPage(1);
    showToast('Filters reset.', 'info');
  };

  // Form Submissions
  const handleAddSubmit = (values: ClientFormValues) => {
    const bmi = Number((values.weightKg / Math.pow(values.heightCm / 100, 2)).toFixed(1));
    
    const newClient: Client = {
      ...values,
      id: `CL-${String(clients.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
      attendanceRate: 100,
      paymentStatus: 'paid',
      bmi,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      profilePic: values.gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100'
        : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100'
    };

    setClients([newClient, ...clients]);
    setIsAdding(false);
    showToast('New client registered successfully!', 'success');
  };

  const handleEditSubmit = (values: ClientFormValues) => {
    if (!selectedClient) return;
    const bmi = Number((values.weightKg / Math.pow(values.heightCm / 100, 2)).toFixed(1));

    const updated = clients.map(c => {
      if (c.id === selectedClient.id) {
        return { ...c, ...values, bmi };
      }
      return c;
    });

    setClients(updated);
    setIsEditing(false);
    setSelectedClient(null);
    showToast('Client records updated successfully.', 'success');
  };

  const handleDeleteConfirm = () => {
    if (!clientToDelete) return;
    const updated = clients.filter(c => c.id !== clientToDelete.id);
    setClients(updated);
    setClientToDelete(null);
    showToast('Client record deleted successfully.', 'success');
  };

  const getCoachName = (coachId: string | null) => {
    if (!coachId) return 'Unassigned';
    return coaches.find(c => c.id === coachId)?.name || 'Unassigned';
  };

  const getPlanName = (planId: string) => {
    return memberships.find(p => p.id === planId)?.name || 'Basic Membership';
  };

  const triggerExport = () => {
    showToast('Exporting clients roster (Excel format)...', 'info');
    setTimeout(() => {
      showToast('Export successful! Check downloads folder.', 'success');
    }, 1200);
  };

  const triggerImport = () => {
    showToast('Upload CSV roster file.', 'info');
  };

  return (
    <PageLayout
      title="Client CRM Directory"
      description="Gym client directories, medical configurations, and personal coach assignments."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerImport} className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-400 hover:text-white">
            <FileUp className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! flex items-center gap-1.5 border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" /> Register Client
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* 1. Client KPI Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Registered" value={statsSummary.total} icon={Users} change="Roster Database" />
          <StatCard title="Active Enrolled" value={statsSummary.active} icon={UserCheck} changeType="increase" change="Checking regularly" />
          <StatCard title="At-Risk Accounts" value={statsSummary.atRisk} icon={AlertTriangle} changeType="decrease" change="Suspended / Overdue" />
          <StatCard title="Pending Review" value={statsSummary.pending} icon={Clock} change="Trial accounts" />
        </div>

        {/* 2. Advanced Search & Filtering Matrix */}
        <div className="glass-panel border-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by ID, name, email or phone..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs py-1.5 border-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
            >
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <Select
              label="Membership Plan"
              value={filterMembership}
              onChange={e => { setFilterMembership(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Plans' },
                ...memberships.map(m => ({ value: m.id, label: m.name }))
              ]}
              className="text-[10px]!"
            />
            
            <Select
              label="Assigned Coach"
              value={filterCoach}
              onChange={e => { setFilterCoach(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Trainers' },
                ...coaches.map(c => ({ value: c.id, label: c.name }))
              ]}
            />

            <Select
              label="Fitness Goal"
              value={filterGoal}
              onChange={e => { setFilterGoal(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Goals' },
                { value: 'weight_loss', label: 'Weight Loss' },
                { value: 'muscle_gain', label: 'Muscle Gain' },
                { value: 'endurance', label: 'Endurance' },
                { value: 'general_health', label: 'General Health' }
              ]}
            />

            <Select
              label="Account Status"
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />

            <Select
              label="Billing Status"
              value={filterPayment}
              onChange={e => { setFilterPayment(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Ledger' },
                { value: 'paid', label: 'Paid Cleared' },
                { value: 'unpaid', label: 'Unpaid Bill' },
                { value: 'overdue', label: 'Overdue Warning' }
              ]}
            />

            <Select
              label="Gender Group"
              value={filterGender}
              onChange={e => { setFilterGender(e.target.value); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>
        </div>

        {/* 3. High Fidelity Client Data Table */}
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40">
                <th className="table-header-cell">Client ID</th>
                <th className="table-header-cell">Profile / Contact</th>
                <th className="table-header-cell">Membership / Renewal</th>
                <th className="table-header-cell">Assigned Coach</th>
                <th className="table-header-cell">Attendance Status</th>
                <th className="table-header-cell">Billing Status</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40 font-semibold">
              {paginatedClients.map(client => (
                <tr key={client.id} className="table-row-hover">
                  <td className="table-data-cell font-mono text-[10.5px] text-slate-500">{client.id}</td>
                  <td className="table-data-cell">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} src={client.profilePic} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{client.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-data-cell">
                    <div>
                      <p className="text-xs text-slate-300">{getPlanName(client.membershipId)}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Renewal: {client.renewalDate}</span>
                    </div>
                  </td>
                  <td className="table-data-cell text-xs text-slate-400">
                    {getCoachName(client.coachId)}
                  </td>
                  <td className="table-data-cell w-48">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Checkin Rate</span>
                        <span>{client.attendanceRate}%</span>
                      </div>
                      <ProgressBar
                        value={client.attendanceRate}
                        variant={client.attendanceRate >= 80 ? 'success' : client.attendanceRate >= 50 ? 'primary' : 'danger'}
                        size="xs"
                      />
                    </div>
                  </td>
                  <td className="table-data-cell">
                    <Badge variant={client.paymentStatus === 'paid' ? 'success' : client.paymentStatus === 'overdue' ? 'danger' : 'warning'}>
                      {client.paymentStatus}
                    </Badge>
                  </td>
                  <td className="table-data-cell text-right">
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                          <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                        </Button>
                      }
                      items={[
                        {
                          label: 'View Profile',
                          icon: Eye,
                          onClick: () => {
                            setSelectedClient(client);
                            setActiveTab('overview');
                            setIsViewing(true);
                          }
                        },
                        {
                          label: 'Edit Records',
                          icon: Edit2,
                          onClick: () => {
                            setSelectedClient(client);
                            setIsEditing(true);
                          }
                        },
                        {
                          label: 'Delete Account',
                          icon: Trash2,
                          danger: true,
                          onClick: () => setClientToDelete(client)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium text-xs">
                    No client records match the selected advanced filter variables.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Paginated Indexing */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRecords={filteredClients.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* OVERLAY & CRM DIALOG MODALS */}

      {/* A. Profile Inspector Modal */}
      {selectedClient && (
        <Dialog
          isOpen={isViewing}
          onClose={() => {
            setIsViewing(false);
            setSelectedClient(null);
          }}
          title={`Member File: ${selectedClient.name}`}
          size="lg"
        >
          <div className="space-y-6 pt-2">
            {/* Profile Summary Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30 p-4 border border-slate-900 rounded-xl">
              <Avatar name={selectedClient.name} src={selectedClient.profilePic} size="lg" />
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-base font-bold text-slate-100">{selectedClient.name}</h4>
                <p className="text-xs text-slate-400 font-medium">Joined {selectedClient.joinDate} • ID: {selectedClient.id}</p>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                  <Badge variant="slate">{selectedClient.gender}</Badge>
                  <Badge variant="slate">{selectedClient.age} yrs</Badge>
                  <Badge variant={selectedClient.status === 'active' ? 'emerald' : 'rose'}>{selectedClient.status}</Badge>
                </div>
              </div>
            </div>

            {/* Profile Tab Navigation links */}
            <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px overflow-x-auto">
              {[
                { id: 'overview', label: 'Biometrics & Health', icon: Info },
                { id: 'membership', label: 'Membership Plans', icon: CreditCard },
                { id: 'metrics', label: 'Workout & Nutrition', icon: Dumbbell },
                { id: 'payments', label: 'Invoice Receipts', icon: DollarSign },
                { id: 'ai', label: 'AI Continuity Risk', icon: Sparkles }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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

            {/* Tab Details */}
            <div className="text-xs sm:text-sm text-slate-300 space-y-4 min-h-[160px]">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3.5 bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-1.5">Contact Metrics</h5>
                    <p><strong className="text-slate-400">Phone:</strong> {selectedClient.phone}</p>
                    <p><strong className="text-slate-400">Email:</strong> {selectedClient.email}</p>
                    <p><strong className="text-slate-400">Address:</strong> {selectedClient.address}</p>
                    <p><strong className="text-slate-400">Emergency Contact:</strong> {selectedClient.emergencyContactName} ({selectedClient.emergencyContactPhone})</p>
                  </div>
                  
                  <div className="space-y-3.5 bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-1.5">Biometrics & Health</h5>
                    <p><strong className="text-slate-400">Blood Group:</strong> {selectedClient.bloodGroup}</p>
                    <p><strong className="text-slate-400">Dimensions:</strong> {selectedClient.heightCm} cm / {selectedClient.weightKg} kg (BMI: {selectedClient.bmi})</p>
                    <p><strong className="text-slate-400">Medical Conditions:</strong> {selectedClient.medicalConditions || 'None Declared'}</p>
                    <p><strong className="text-slate-400">Allergies:</strong> {selectedClient.allergies || 'None Declared'}</p>
                  </div>
                </div>
              )}

              {/* Tab 2: Membership */}
              {activeTab === 'membership' && (
                <div className="space-y-4 bg-slate-950/20 p-4 rounded-lg border border-slate-900">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold text-slate-200">{getPlanName(selectedClient.membershipId)} Plan</h4>
                      <p className="text-xs text-slate-500 font-semibold">Billed recurring via Stripe API</p>
                    </div>
                    <Badge variant={selectedClient.paymentStatus === 'paid' ? 'emerald' : 'rose'}>{selectedClient.paymentStatus}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                    <p><strong className="text-slate-400">Enrolled:</strong> {selectedClient.joinDate}</p>
                    <p><strong className="text-slate-400">Renewal Cycle:</strong> {selectedClient.renewalDate}</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Metrics */}
              {activeTab === 'metrics' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-1.5">Coaching Assignments</h5>
                    <p><strong className="text-slate-400">Assigned Coach:</strong> {getCoachName(selectedClient.coachId)}</p>
                    <p><strong className="text-slate-400">Training Routine:</strong> {selectedClient.workoutPlanId || 'Standard Barbell Protocol'}</p>
                    <p><strong className="text-slate-400">Dietary Program:</strong> {selectedClient.dietPlanId || 'Hypertrophy Diet Schedule'}</p>
                  </div>

                  <div className="space-y-3 bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-1.5">Attendance Patterns</h5>
                    <p><strong className="text-slate-400">Checkin Rate:</strong> {selectedClient.attendanceRate}% average</p>
                    <p><strong className="text-slate-400">Last Visited Gym:</strong> {selectedClient.lastVisitDate || '2026-07-17'}</p>
                  </div>
                </div>
              )}

              {/* Tab 4: Payments */}
              {activeTab === 'payments' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider">Cleared Receipts Ledger</h5>
                  <div className="table-container text-[11px] font-semibold text-slate-400">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/60">
                          <th className="p-2 border-b border-slate-900">Receipt ID</th>
                          <th className="p-2 border-b border-slate-900">Plan Covered</th>
                          <th className="p-2 border-b border-slate-900">Amount</th>
                          <th className="p-2 border-b border-slate-900">Gateway</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        <tr>
                          <td className="p-2 font-mono text-[10px]">#INV-9284</td>
                          <td className="p-2 text-slate-300">{getPlanName(selectedClient.membershipId)}</td>
                          <td className="p-2 text-slate-200">$129.00</td>
                          <td className="p-2 text-emerald-500">Stripe Live</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: AI Insights */}
              {activeTab === 'ai' && (
                <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    <h5 className="font-bold uppercase tracking-wider text-slate-200">Gemini Predictive Continuity</h5>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    This client demonstrates an attendance rating of <strong className="text-emerald-400">{selectedClient.attendanceRate}%</strong>. Historical checking parameters indicate a low continuity attrition risk.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">
                      Continuity Risk: Low
                    </span>
                    <span className="text-[9px] bg-blue-500/5 border border-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase">
                      Engagement: High
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Dialog>
      )}

      {/* B. Add Client Modal */}
      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Register Gym Account">
        <FormWrapper
          schema={clientValidationSchema}
          onSubmit={handleAddSubmit}
          defaultValues={{
            name: '',
            email: '',
            phone: '',
            membershipId: 'basic-monthly',
            coachId: 'coach-1',
            status: 'active',
            gender: 'male',
            age: 25,
            dob: '2001-01-01',
            emergencyContactName: '',
            emergencyContactPhone: '',
            bloodGroup: 'O+',
            address: '',
            heightCm: 175,
            weightKg: 70,
            fitnessGoal: 'muscle_gain',
            medicalConditions: 'None',
            allergies: 'None',
            notes: 'Registered via Stage 5 Client CRM form.'
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">1. Member Info</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <Input {...register('name')} placeholder="Sarah Jenkins" />
                </FormField>
                <FormField label="Email" error={errors.email?.message} required>
                  <Input type="email" {...register('email')} placeholder="sarah@example.com" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone" error={errors.phone?.message} required>
                  <Input {...register('phone')} placeholder="+1 (555) 019-2834" />
                </FormField>
                <FormField label="Preferred Goal" error={errors.fitnessGoal?.message}>
                  <Select
                    {...register('fitnessGoal')}
                    options={[
                      { value: 'weight_loss', label: 'Weight Loss' },
                      { value: 'muscle_gain', label: 'Muscle Gain' },
                      { value: 'endurance', label: 'Endurance' },
                      { value: 'general_health', label: 'General Health' }
                    ]}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Gender" error={errors.gender?.message}>
                  <Select
                    {...register('gender')}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </FormField>
                <FormField label="Age" error={errors.age?.message}>
                  <Input type="number" {...register('age')} />
                </FormField>
                <FormField label="DOB" error={errors.dob?.message} required>
                  <Input type="date" {...register('dob')} className="scheme-dark" />
                </FormField>
              </div>

              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mt-4">2. Emergencies & Health</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message} required>
                  <Input {...register('emergencyContactName')} placeholder="Robert Jenkins" />
                </FormField>
                <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message} required>
                  <Input {...register('emergencyContactPhone')} placeholder="+1 (555) 019-2835" />
                </FormField>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <FormField label="Blood" error={errors.bloodGroup?.message}>
                  <Select
                    {...register('bloodGroup')}
                    options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))}
                  />
                </FormField>
                <FormField label="Height (cm)" error={errors.heightCm?.message}>
                  <Input type="number" {...register('heightCm')} />
                </FormField>
                <FormField label="Weight (kg)" error={errors.weightKg?.message}>
                  <Input type="number" {...register('weightKg')} />
                </FormField>
                <FormField label="Status" error={errors.status?.message}>
                  <Select
                    {...register('status')}
                    options={['active', 'inactive', 'pending', 'suspended'].map(s => ({ value: s, label: s }))}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Medical Conditions" error={errors.medicalConditions?.message}>
                  <Input {...register('medicalConditions')} placeholder="None / Back pain" />
                </FormField>
                <FormField label="Allergies" error={errors.allergies?.message}>
                  <Input {...register('allergies')} placeholder="None / Peanuts" />
                </FormField>
              </div>

              <FormField label="Address" error={errors.address?.message} required>
                <Input {...register('address')} placeholder="122 Marina Blvd, San Francisco, CA" />
              </FormField>

              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mt-4">3. Plan Assignments</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Membership Tier" error={errors.membershipId?.message} required>
                  <Select
                    {...register('membershipId')}
                    options={memberships.map(m => ({ value: m.id, label: m.name }))}
                  />
                </FormField>
                <FormField label="Assigned Coach" error={errors.coachId?.message}>
                  <Select
                    {...register('coachId')}
                    options={[
                      { value: '', label: 'Unassigned Coach' },
                      ...coaches.map(c => ({ value: c.id, label: c.name }))
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Notes" error={errors.notes?.message}>
                <Input {...register('notes')} placeholder="Add optional details..." />
              </FormField>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="text-xs">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                  Save Record
                </Button>
              </div>
            </div>
          )}
        </FormWrapper>
      </Dialog>

      {/* C. Edit Client Modal */}
      {selectedClient && (
        <Dialog isOpen={isEditing} onClose={() => setIsEditing(false)} title={`Edit Profile: ${selectedClient.name}`}>
          <FormWrapper
            schema={clientValidationSchema}
            onSubmit={handleEditSubmit}
            defaultValues={{
              name: selectedClient.name,
              email: selectedClient.email,
              phone: selectedClient.phone,
              membershipId: selectedClient.membershipId,
              coachId: selectedClient.coachId,
              status: selectedClient.status,
              gender: selectedClient.gender,
              age: selectedClient.age,
              dob: selectedClient.dob,
              emergencyContactName: selectedClient.emergencyContactName,
              emergencyContactPhone: selectedClient.emergencyContactPhone,
              bloodGroup: selectedClient.bloodGroup,
              address: selectedClient.address,
              heightCm: selectedClient.heightCm,
              weightKg: selectedClient.weightKg,
              fitnessGoal: selectedClient.fitnessGoal,
              medicalConditions: selectedClient.medicalConditions || '',
              allergies: selectedClient.allergies || '',
              notes: selectedClient.notes || ''
            }}
          >
            {({ register, formState: { errors } }) => (
              <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">1. Member Info</h5>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name" error={errors.name?.message} required>
                    <Input {...register('name')} />
                  </FormField>
                  <FormField label="Email" error={errors.email?.message} required>
                    <Input type="email" {...register('email')} />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Phone" error={errors.phone?.message} required>
                    <Input {...register('phone')} />
                  </FormField>
                  <FormField label="Preferred Goal" error={errors.fitnessGoal?.message}>
                    <Select
                      {...register('fitnessGoal')}
                      options={[
                        { value: 'weight_loss', label: 'Weight Loss' },
                        { value: 'muscle_gain', label: 'Muscle Gain' },
                        { value: 'endurance', label: 'Endurance' },
                        { value: 'general_health', label: 'General Health' }
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Gender" error={errors.gender?.message}>
                    <Select
                      {...register('gender')}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </FormField>
                  <FormField label="Age" error={errors.age?.message}>
                    <Input type="number" {...register('age')} />
                  </FormField>
                  <FormField label="DOB" error={errors.dob?.message} required>
                    <Input type="date" {...register('dob')} className="scheme-dark" />
                  </FormField>
                </div>

                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mt-4">2. Emergencies & Health</h5>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message} required>
                    <Input {...register('emergencyContactName')} />
                  </FormField>
                  <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message} required>
                    <Input {...register('emergencyContactPhone')} />
                  </FormField>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <FormField label="Blood" error={errors.bloodGroup?.message}>
                    <Select
                      {...register('bloodGroup')}
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))}
                    />
                  </FormField>
                  <FormField label="Height (cm)" error={errors.heightCm?.message}>
                    <Input type="number" {...register('heightCm')} />
                  </FormField>
                  <FormField label="Weight (kg)" error={errors.weightKg?.message}>
                    <Input type="number" {...register('weightKg')} />
                  </FormField>
                  <FormField label="Status" error={errors.status?.message}>
                    <Select
                      {...register('status')}
                      options={['active', 'inactive', 'pending', 'suspended'].map(s => ({ value: s, label: s }))}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Medical Conditions" error={errors.medicalConditions?.message}>
                    <Input {...register('medicalConditions')} />
                  </FormField>
                  <FormField label="Allergies" error={errors.allergies?.message}>
                    <Input {...register('allergies')} />
                  </FormField>
                </div>

                <FormField label="Address" error={errors.address?.message} required>
                  <Input {...register('address')} />
                </FormField>

                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1 mt-4">3. Plan Assignments</h5>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Membership Tier" error={errors.membershipId?.message} required>
                    <Select
                      {...register('membershipId')}
                      options={memberships.map(m => ({ value: m.id, label: m.name }))}
                    />
                  </FormField>
                  <FormField label="Assigned Coach" error={errors.coachId?.message}>
                    <Select
                      {...register('coachId')}
                      options={[
                        { value: '', label: 'Unassigned Coach' },
                        ...coaches.map(c => ({ value: c.id, label: c.name }))
                      ]}
                    />
                  </FormField>
                </div>

                <FormField label="Notes" error={errors.notes?.message}>
                  <Input {...register('notes')} />
                </FormField>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedClient(null);
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </FormWrapper>
        </Dialog>
      )}

      {/* D. Delete Confirmation Dialog */}
      {clientToDelete && (
        <ConfirmationDialog
          isOpen={!!clientToDelete}
          onClose={() => setClientToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Client Account"
          message={`Are you sure you want to permanently delete the profile for ${clientToDelete.name}? This action clears all check-in averages and invoice records, and cannot be undone.`}
          variant="danger"
          confirmLabel="Delete Account"
        />
      )}
    </PageLayout>
  );
}

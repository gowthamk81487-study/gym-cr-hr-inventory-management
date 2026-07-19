'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign,
  Contact2
} from 'lucide-react';
import { clientService, coachService, membershipService, paymentService, authService } from '@/services';
import { enquiryService } from '@/services/index';
import { Client, Coach, Membership } from '@/types';
import { exportData } from '@/utils/export';
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
import { EnquiryRecord } from '@/services/db';

// Zod Form Validation Schema
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
  const [clients, setClients] = useState<Client[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);

  // Navigation
  const [viewMode, setViewMode] = useState<'roster' | 'enquiries'>('roster');

  // Filter States
  const [search, setSearch] = useState('');
  const [filterMembership, setFilterMembership] = useState('all');
  const [filterCoach, setFilterCoach] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterGoal, setFilterGoal] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterEnquiryStatus, setFilterEnquiryStatus] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Overlays
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'membership' | 'metrics' | 'payments' | 'ai'>('overview');

  // Enquiry Overlays
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isViewingEnquiry, setIsViewingEnquiry] = useState(false);
  const [isAssigningManager, setIsAssigningManager] = useState(false);
  const [isLoggingContact, setIsLoggingContact] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [assignedManager, setAssignedManager] = useState(' Alex Pierce ');
  const [contactNotes, setContactNotes] = useState('');
  
  // Convert Form states
  const [convertForm, setConvertForm] = useState({
    dob: '2001-01-01',
    membershipId: 'basic-monthly',
    paymentMode: 'gateway' as 'cash' | 'upi' | 'credit_card' | 'gateway' | 'qr',
    referenceNumber: '',
    screenshotFile: ''
  });

  const [generatedCreds, setGeneratedCreds] = useState<{ email: string; pass: string } | null>(null);
  const [isShowingCreds, setIsShowingCreds] = useState(false);

  const loadData = async () => {
    try {
      const cls = await clientService.getAll();
      setClients(cls);
      const cos = await coachService.getAll();
      setCoaches(cos);
      const mems = await membershipService.getAll();
      setMemberships(mems);
      const enqs = await enquiryService.getAll();
      setEnquiries(enqs);
    } catch {
      showToast('Error loading CRM registries.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute statistics
  const statsSummary = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const atRisk = clients.filter(c => c.status === 'suspended' || c.paymentStatus === 'overdue').length;
    const pending = enquiries.filter(e => e.status !== 'converted' && e.status !== 'rejected').length;
    return { total, active, atRisk, pending };
  }, [clients, enquiries]);

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

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search) ||
        e.message.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = filterEnquiryStatus === 'all' || e.status === filterEnquiryStatus;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, filterEnquiryStatus]);

  const paginatedClients = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const handleExportClients = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredClients.length === 0) {
      showToast('No client data to export.', 'error');
      return;
    }

    const headers = ['Client ID', 'Full Name', 'Email', 'Phone', 'Membership Plan', 'Assigned Coach', 'Attendance Rate (%)', 'Status', 'Billing status'];
    const rows = filteredClients.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone,
      getPlanName(c.membershipId),
      getCoachName(c.coachId),
      c.attendanceRate,
      c.status,
      c.paymentStatus
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Clients_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting clients to CSV.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting clients to Excel.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Member Client CRM Registry', headers, rows, filename);
      showToast('Exporting clients to PDF print.', 'success');
    }
  };

  // Form Submissions
  const handleAddSubmit = async (values: ClientFormValues) => {
    const bmi = Number((values.weightKg / Math.pow(values.heightCm / 100, 2)).toFixed(1));
    
    // Auto generate credentials
    const cleanName = values.name.toLowerCase().replace(/[^a-z]/g, '');
    const dobParts = values.dob.split('-');
    const dd = dobParts[2] || '01';
    const mm = dobParts[1] || '01';
    const yyyy = dobParts[0] || '2001';
    const autoEmail = `${cleanName}${dd}${mm}${yyyy}@thegymfitnesshub.in`;
    const autoPass = `${cleanName}@${dd}${mm}${yyyy}`;

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

    try {
      // Prevent duplicate registrations
      const list = await clientService.getAll();
      if (list.some(c => c.email.toLowerCase() === values.email.toLowerCase())) {
        showToast('A client with this email address already exists.', 'error');
        return;
      }

      await clientService.create(newClient);
      await authService.createUserAccount(autoEmail, autoPass, 'client', newClient.id);
      
      setGeneratedCreds({ email: autoEmail, pass: autoPass });
      setIsShowingCreds(true);
      setIsAdding(false);
      loadData();
      showToast('Client account registered successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error registering client.', 'error');
    }
  };

  const handleEditSubmit = async (values: ClientFormValues) => {
    if (!selectedClient) return;
    const bmi = Number((values.weightKg / Math.pow(values.heightCm / 100, 2)).toFixed(1));

    try {
      await clientService.update({ ...selectedClient, ...values, bmi });
      setIsEditing(false);
      setSelectedClient(null);
      loadData();
      showToast('Client records updated.', 'success');
    } catch {
      showToast('Update failed.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      await clientService.delete(clientToDelete.id);
      setClientToDelete(null);
      loadData();
      showToast('Client records deleted.', 'success');
    } catch {
      showToast('Deletion failed.', 'error');
    }
  };

  // Onboarding Workflow Actions
  const handleAssignManager = async () => {
    if (!selectedEnquiry) return;
    const list = [...enquiries];
    const idx = list.findIndex(e => e.id === selectedEnquiry.id);
    if (idx !== -1) {
      list[idx].assignedManager = assignedManager;
      list[idx].status = 'in_progress';
      await enquiryService.save(list);
      showToast(`Manager assigned to enquiry!`, 'success');
    }
    setIsAssigningManager(false);
    loadData();
  };

  const handleLogContact = async () => {
    if (!selectedEnquiry) return;
    const list = [...enquiries];
    const idx = list.findIndex(e => e.id === selectedEnquiry.id);
    if (idx !== -1) {
      list[idx].contactNotes = contactNotes;
      list[idx].status = 'replied';
      await enquiryService.save(list);
      showToast('Contact logs updated.', 'success');
    }
    setIsLoggingContact(false);
    loadData();
  };

  const handleSchedulePR = async (id: string) => {
    const list = [...enquiries];
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx].status = 'in_progress';
      await enquiryService.save(list);
      showToast('PR Week Program scheduled. Customer notified.', 'success');
    }
    loadData();
  };

  const handleUpdateEnquiryStatus = async (id: string, nextStatus: any) => {
    const list = [...enquiries];
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx].status = nextStatus;
      await enquiryService.save(list);
      showToast('Enquiry status updated.', 'success');
    }
    loadData();
  };

  const handleDeleteEnquiry = async (id: string) => {
    const list = enquiries.filter(e => e.id !== id);
    await enquiryService.save(list);
    showToast('Enquiry deleted successfully.', 'success');
    setIsViewingEnquiry(false);
    setSelectedEnquiry(null);
    loadData();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      // 1. Generate client email / password credentials
      const cleanName = selectedEnquiry.name.toLowerCase().replace(/[^a-z]/g, '');
      const dobParts = convertForm.dob.split('-');
      const dd = dobParts[2] || '01';
      const mm = dobParts[1] || '01';
      const yyyy = dobParts[0] || '2001';
      const clientEmail = `${cleanName}${dd}${mm}${yyyy}@thegymfitnesshub.in`;
      const clientPassword = `${cleanName}@${dd}${mm}${yyyy}`;

      const targetPlan = memberships.find(p => p.id === convertForm.membershipId);
      const planPrice = targetPlan ? targetPlan.price : 49;

      // 2. Add client account
      const newClient: Client = {
        id: `CL-${String(clients.length + 1).padStart(3, '0')}`,
        name: selectedEnquiry.name,
        email: selectedEnquiry.email,
        phone: selectedEnquiry.phone,
        membershipId: convertForm.membershipId,
        status: 'pending', // Starts as pending until PR Starter program completes
        joinDate: new Date().toISOString().split('T')[0],
        coachId: null,
        attendanceRate: 100,
        paymentStatus: convertForm.paymentMode === 'qr' ? 'unpaid' : 'paid',
        gender: 'male',
        age: 25,
        dob: convertForm.dob,
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: selectedEnquiry.phone,
        bloodGroup: 'O+',
        address: '100 Gym St, San Francisco, CA',
        heightCm: 175,
        weightKg: 70,
        bmi: 22.9,
        fitnessGoal: 'general_health',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      await clientService.create(newClient);

      // Save credentials to mock auth
      await authService.createUserAccount(clientEmail, clientPassword, 'client', newClient.id);

      // 3. Register payment
      await paymentService.create({
        id: `INV-${Date.now().toString().slice(-4)}`,
        clientId: newClient.id,
        clientName: newClient.name,
        amount: planPrice,
        date: new Date().toISOString().split('T')[0],
        status: convertForm.paymentMode === 'qr' ? 'pending' : 'paid',
        paymentMethod: convertForm.paymentMode,
        membershipName: targetPlan ? targetPlan.name : 'Basic Pack',
        referenceNumber: convertForm.referenceNumber,
        screenshotProof: convertForm.screenshotFile || undefined
      });

      // 4. Update enquiry status
      const enqs = [...enquiries];
      const enqIdx = enqs.findIndex(en => en.id === selectedEnquiry.id);
      if (enqIdx !== -1) {
        enqs[enqIdx].status = 'converted';
        await enquiryService.save(enqs);
      }

      setGeneratedCreds({ email: clientEmail, pass: clientPassword });
      setIsShowingCreds(true);
      setIsConverting(false);
      setSelectedEnquiry(null);
      loadData();
      showToast('Client converted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error converting client.', 'error');
    }
  };

  const getCoachName = (coachId: string | null) => {
    if (!coachId) return 'Unassigned';
    return coaches.find(c => c.id === coachId)?.name || 'Unassigned';
  };

  const getPlanName = (planId: string) => {
    return memberships.find(p => p.id === planId)?.name || 'Basic Membership';
  };

  return (
    <PageLayout
      title="Client CRM Directory"
      description="Monitor customer enquiries, complete PR Week onboardings, and search client records."
      actions={
        <div className="flex gap-2">
          {viewMode === 'roster' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <Plus className="h-4 w-4" /> Register Client
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* KPI stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Clients" value={statsSummary.total} icon={Users} change="Roster DB" />
          <StatCard title="Active Enrolled" value={statsSummary.active} icon={UserCheck} change="Active schedules" />
          <StatCard title="At-Risk Profiles" value={statsSummary.atRisk} icon={AlertTriangle} change="Suspended / Overdue" changeType="decrease" />
          <StatCard title="Pending Enquiries" value={statsSummary.pending} icon={Clock} change="Leads awaiting contact" changeType="increase" />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          <button
            onClick={() => { setViewMode('roster'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
              viewMode === 'roster' ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
            }`}
          >
            <Users className="h-4 w-4" /> Client Roster
          </button>
          <button
            onClick={() => { setViewMode('enquiries'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
              viewMode === 'enquiries' ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
            }`}
          >
            <Contact2 className="h-4 w-4" /> Enquiries Queue
          </button>
        </div>

        {/* Client Roster View */}
        {viewMode === 'roster' && (
          <div className="space-y-6">
            {/* Filters Matrix */}
            <div className="glass-panel border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
                  />
                </div>
                <div className="flex gap-2 self-stretch md:self-auto justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleExportClients('pdf')} className="text-xs border-slate-850 hover:text-white">PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportClients('xlsx')} className="text-xs border-slate-850 hover:text-white">Excel</Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportClients('csv')} className="text-xs border-slate-850 hover:text-white">CSV</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <Select
                  label="Plan Tier"
                  value={filterMembership}
                  onChange={e => { setFilterMembership(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'All Plans' },
                    ...memberships.map(m => ({ value: m.id, label: m.name }))
                  ]}
                />
                <Select
                  label="Coach"
                  value={filterCoach}
                  onChange={e => { setFilterCoach(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'All Coaches' },
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
                    { value: 'pending', label: 'Pending PR' },
                    { value: 'suspended', label: 'Suspended' }
                  ]}
                />
                <Select
                  label="Ledger Status"
                  value={filterPayment}
                  onChange={e => { setFilterPayment(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'all', label: 'All Ledger' },
                    { value: 'paid', label: 'Paid Cleared' },
                    { value: 'unpaid', label: 'Unpaid' },
                    { value: 'overdue', label: 'Overdue' }
                  ]}
                />
              </div>
            </div>

            {/* Clients Table */}
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Client ID</th>
                    <th className="p-3">Profile / Contact</th>
                    <th className="p-3">Membership Plan</th>
                    <th className="p-3">Assigned Coach</th>
                    <th className="p-3">Attendance Rate</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedClients.map(client => (
                    <tr key={client.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-slate-500">{client.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={client.name} src={client.profilePic} size="sm" />
                          <div>
                            <p className="font-bold text-slate-200">{client.name}</p>
                            <span className="text-[9.5px] text-slate-500 font-semibold">{client.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p>{getPlanName(client.membershipId)}</p>
                          <span className="text-[9.5px] text-slate-500 font-semibold">Renews: {client.renewalDate}</span>
                        </div>
                      </td>
                      <td className="p-3">{getCoachName(client.coachId)}</td>
                      <td className="p-3 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Check-in Rate</span>
                            <span>{client.attendanceRate}%</span>
                          </div>
                          <ProgressBar value={client.attendanceRate} size="xs" variant={client.attendanceRate >= 80 ? 'success' : 'primary'} />
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={client.status === 'active' ? 'emerald' : client.status === 'pending' ? 'warning' : 'rose'}>
                          {client.status === 'pending' ? 'pending PR' : client.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
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
                  {paginatedClients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                        No clients registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalRecords={filteredClients.length} itemsPerPage={itemsPerPage} />
          </div>
        )}

        {/* Enquiries Queue View */}
        {viewMode === 'enquiries' && (
          <div className="space-y-4">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Enquiry ID</th>
                    <th className="p-3">Customer Info</th>
                    <th className="p-3">Target Branch</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Assigned Manager</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredEnquiries.map(enq => (
                    <tr key={enq.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-slate-500">{enq.id}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-200">{enq.name}</p>
                          <span className="text-[9.5px] text-slate-500 font-semibold">{enq.email} • {enq.phone}</span>
                        </div>
                      </td>
                      <td className="p-3 uppercase text-[9.5px] text-blue-400">{enq.branch}</td>
                      <td className="p-3 text-slate-400 max-w-xs truncate">{enq.message}</td>
                      <td className="p-3 text-slate-500">{enq.assignedManager || 'Unassigned'}</td>
                      <td className="p-3">
                        <Badge variant={enq.status === 'converted' ? 'emerald' : enq.status === 'new' ? 'blue' : 'warning'}>
                          {enq.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {enq.status !== 'converted' ? (
                          <Dropdown
                            trigger={
                              <Button variant="ghost" size="sm" className="p-1 rounded-lg">
                                <MoreVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                              </Button>
                            }
                            items={[
                              {
                                label: 'Assign Manager',
                                icon: Briefcase,
                                onClick: () => {
                                  setSelectedEnquiry(enq);
                                  setIsAssigningManager(true);
                                }
                              },
                              {
                                label: 'Log Contact Call',
                                icon: Activity,
                                onClick: () => {
                                  setSelectedEnquiry(enq);
                                  setIsLoggingContact(true);
                                }
                              },
                              {
                                label: 'Schedule PR Week',
                                icon: Calendar,
                                onClick: () => handleSchedulePR(enq.id)
                              },
                              {
                                label: 'Convert to Client',
                                icon: Sparkles,
                                onClick: () => {
                                  setSelectedEnquiry(enq);
                                  setIsConverting(true);
                                }
                              }
                            ]}
                          />
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold uppercase">Converted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                        No enquiries received.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Profile Inspector Modal */}
      {selectedClient && (
        <Dialog isOpen={isViewing} onClose={() => { setIsViewing(false); setSelectedClient(null); }} title={`Member File: ${selectedClient.name}`} size="lg">
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30 p-4 border border-slate-900 rounded-xl">
              <Avatar name={selectedClient.name} src={selectedClient.profilePic} size="lg" />
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-base font-bold text-slate-100">{selectedClient.name}</h4>
                <p className="text-xs text-slate-400 font-medium">ID: {selectedClient.id} • Joined {selectedClient.joinDate}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="slate">{selectedClient.gender}</Badge>
                  <Badge variant="slate">{selectedClient.age} yrs</Badge>
                  <Badge variant={selectedClient.status === 'active' ? 'emerald' : 'rose'}>{selectedClient.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
              {['overview', 'membership', 'metrics', 'ai'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                    activeTab === t ? 'border-blue-500 text-slate-100' : 'border-transparent hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="text-xs sm:text-sm text-slate-300 space-y-4">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded border border-slate-900">
                    <h5 className="font-bold border-b border-slate-900 pb-1.5">Contact Details</h5>
                    <p>Phone: {selectedClient.phone}</p>
                    <p>Email: {selectedClient.email}</p>
                    <p>Address: {selectedClient.address}</p>
                  </div>
                  <div className="space-y-2 bg-slate-950/40 p-3 rounded border border-slate-900">
                    <h5 className="font-bold border-b border-slate-900 pb-1.5">Biometrics</h5>
                    <p>Weight: {selectedClient.weightKg} kg • Height: {selectedClient.heightCm} cm</p>
                    <p>BMI: {selectedClient.bmi}</p>
                    <p>Allergies: {selectedClient.allergies || 'None'}</p>
                  </div>
                </div>
              )}
              {activeTab === 'membership' && (
                <div className="bg-slate-950/40 p-4 rounded border border-slate-900 space-y-2">
                  <h4 className="font-bold text-slate-200">{getPlanName(selectedClient.membershipId)}</h4>
                  <p>Status: <Badge variant="emerald">{selectedClient.paymentStatus}</Badge></p>
                  <p>Renewal Expiry: {selectedClient.renewalDate}</p>
                </div>
              )}
              {activeTab === 'metrics' && (
                <div className="bg-slate-950/40 p-4 rounded border border-slate-900 space-y-2">
                  <p>Assigned Coach: {getCoachName(selectedClient.coachId)}</p>
                  <p>Attendance Rate: {selectedClient.attendanceRate}%</p>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 space-y-2">
                  <h5 className="font-bold text-blue-400 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Continuity Analysis</h5>
                  <p className="text-slate-400">Visitor rate is {selectedClient.attendanceRate}%. Attrition risk is classified as Low.</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Manual Roster Registration */}
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
            emergencyContactName: 'Emergency Person',
            emergencyContactPhone: '',
            bloodGroup: 'O+',
            address: '100 Fitness St',
            heightCm: 175,
            weightKg: 70,
            fitnessGoal: 'muscle_gain',
            medicalConditions: 'None',
            allergies: 'None',
            notes: ''
          }}
        >
          {({ register, formState: { errors } }) => (
            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <Input {...register('name')} placeholder=" Gowtham Raj " />
                </FormField>
                <FormField label="Email" error={errors.email?.message} required>
                  <Input type="email" {...register('email')} placeholder="gowtham@example.com" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone" error={errors.phone?.message} required>
                  <Input {...register('phone')} placeholder="+91 9876543210" />
                </FormField>
                <FormField label="DOB" error={errors.dob?.message} required>
                  <Input type="date" {...register('dob')} className="scheme-dark" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Membership Plan" error={errors.membershipId?.message} required>
                  <Select {...register('membershipId')} options={memberships.map(m => ({ value: m.id, label: m.name }))} />
                </FormField>
                <FormField label="Assigned Coach" error={errors.coachId?.message}>
                  <Select {...register('coachId')} options={[{ value: '', label: 'Unassigned' }, ...coaches.map(c => ({ value: c.id, label: c.name }))]} />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Gender" error={errors.gender?.message}><Select {...register('gender')} options={['male', 'female', 'other'].map(g => ({ value: g, label: g }))} /></FormField>
                <FormField label="Age" error={errors.age?.message}><Input type="number" {...register('age')} /></FormField>
                <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message}><Input {...register('emergencyContactName')} /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message} required><Input {...register('emergencyContactPhone')} /></FormField>
                <FormField label="Address" error={errors.address?.message} required><Input {...register('address')} /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Fitness Goal" error={errors.fitnessGoal?.message} required>
                  <Select {...register('fitnessGoal')} options={[
                    { value: 'weight_loss', label: 'Weight Loss' },
                    { value: 'muscle_gain', label: 'Muscle Gain' },
                    { value: 'endurance', label: 'Endurance' },
                    { value: 'general_health', label: 'General Health' }
                  ]} />
                </FormField>
                <FormField label="Blood Group"><Select {...register('bloodGroup')} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))} /></FormField>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Height (cm)"><Input type="number" {...register('heightCm')} /></FormField>
                <FormField label="Weight (kg)"><Input type="number" {...register('weightKg')} /></FormField>
                <FormField label="Status"><Select {...register('status')} options={['active', 'inactive', 'pending', 'suspended'].map(s => ({ value: s, label: s }))} /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Medical Conditions" error={errors.medicalConditions?.message}><Input {...register('medicalConditions')} /></FormField>
                <FormField label="Allergies" error={errors.allergies?.message}><Input {...register('allergies')} /></FormField>
              </div>
              <FormField label="Notes" error={errors.notes?.message}><Input {...register('notes')} /></FormField>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">Save & Register</Button>
              </div>
            </div>
          )}
        </FormWrapper>
      </Dialog>

      {/* Edit Client Modal */}
      {selectedClient && (
        <Dialog isOpen={isEditing} onClose={() => { setIsEditing(false); setSelectedClient(null); }} title={`Edit Client: ${selectedClient.name}`}>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Full Name" error={errors.name?.message} required><Input {...register('name')} /></FormField>
                  <FormField label="Email" error={errors.email?.message} required><Input type="email" {...register('email')} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Phone" error={errors.phone?.message} required><Input {...register('phone')} /></FormField>
                  <FormField label="DOB" error={errors.dob?.message} required><Input type="date" {...register('dob')} className="scheme-dark" /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Membership" required><Select {...register('membershipId')} options={memberships.map(m => ({ value: m.id, label: m.name }))} /></FormField>
                  <FormField label="Status"><Select {...register('status')} options={['active', 'inactive', 'pending', 'suspended'].map(s => ({ value: s, label: s }))} /></FormField>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormField label="Gender" error={errors.gender?.message}><Select {...register('gender')} options={['male', 'female', 'other'].map(g => ({ value: g, label: g }))} /></FormField>
                  <FormField label="Age" error={errors.age?.message}><Input type="number" {...register('age')} /></FormField>
                  <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message}><Input {...register('emergencyContactName')} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message} required><Input {...register('emergencyContactPhone')} /></FormField>
                  <FormField label="Address" error={errors.address?.message} required><Input {...register('address')} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Fitness Goal" error={errors.fitnessGoal?.message} required>
                    <Select {...register('fitnessGoal')} options={[
                      { value: 'weight_loss', label: 'Weight Loss' },
                      { value: 'muscle_gain', label: 'Muscle Gain' },
                      { value: 'endurance', label: 'Endurance' },
                      { value: 'general_health', label: 'General Health' }
                    ]} />
                  </FormField>
                  <FormField label="Blood Group"><Select {...register('bloodGroup')} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => ({ value: b, label: b }))} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Height (cm)"><Input type="number" {...register('heightCm')} /></FormField>
                  <FormField label="Weight (kg)"><Input type="number" {...register('weightKg')} /></FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Medical Conditions" error={errors.medicalConditions?.message}><Input {...register('medicalConditions')} /></FormField>
                  <FormField label="Allergies" error={errors.allergies?.message}><Input {...register('allergies')} /></FormField>
                </div>
                <FormField label="Notes" error={errors.notes?.message}><Input {...register('notes')} /></FormField>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setSelectedClient(null); }} className="text-xs">Cancel</Button>
                  <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">Save Changes</Button>
                </div>
              </div>
            )}
          </FormWrapper>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {clientToDelete && (
        <ConfirmationDialog
          isOpen={!!clientToDelete}
          onClose={() => setClientToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Client Profile"
          message={`Are you sure you want to delete ${clientToDelete.name}? This will permanently remove their records from the local databases.`}
        />
      )}

      {/* CRM Onboarding Overlays */}
      
      {/* 1. Assign Manager Dialog */}
      <Dialog isOpen={isAssigningManager} onClose={() => setIsAssigningManager(false)} title="Assign Account Manager">
        <div className="space-y-4 pt-2">
          <Select
            label="Select Assigned Manager"
            options={[
              { value: 'Alex Pierce', label: 'Alex Pierce (General Manager)' },
              { value: 'Clara Oswald', label: 'Clara Oswald (Admin Manager)' },
              { value: 'Danny Pink', label: 'Danny Pink (Reception Manager)' }
            ]}
            value={assignedManager}
            onChange={e => setAssignedManager(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsAssigningManager(false)} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAssignManager} className="text-xs px-4!">Assign Manager</Button>
          </div>
        </div>
      </Dialog>

      {/* 2. Log Contact Call Dialog */}
      <Dialog isOpen={isLoggingContact} onClose={() => setIsLoggingContact(false)} title="Log Customer Contact Call">
        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contact notes & outcome</label>
            <textarea
              rows={3}
              value={contactNotes}
              onChange={e => setContactNotes(e.target.value)}
              placeholder="Called client to discuss schedule. Indicated interest in Elite plan, scheduling PR Week."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsLoggingContact(false)} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleLogContact} className="text-xs px-4!">Save logs</Button>
          </div>
        </div>
      </Dialog>

      {/* 3. Convert Enquiry to Client Dialog */}
      <Dialog isOpen={isConverting} onClose={() => setIsConverting(false)} title={`Convert Enquiry: ${selectedEnquiry?.name}`}>
        <form onSubmit={handleConvert} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="DOB (Mandatory to generate credentials)" type="date" required value={convertForm.dob} onChange={e => setConvertForm({ ...convertForm, dob: e.target.value })} className="scheme-dark" />
            <Select label="Select Membership plan" options={memberships.map(m => ({ value: m.id, label: `${m.name} ($${m.price})` }))} value={convertForm.membershipId} onChange={e => setConvertForm({ ...convertForm, membershipId: e.target.value })} />
          </div>

          <Select
            label="Payment Mode"
            options={[
              { value: 'gateway', label: 'Payment Gateway (Instant Auto-activation)' },
              { value: 'cash', label: 'Cash on Counter' },
              { value: 'upi', label: 'UPI Direct Transaction' },
              { value: 'credit_card', label: 'Card Payment' },
              { value: 'qr', label: 'QR Scan Slip Upload (Admin verification required)' }
            ]}
            value={convertForm.paymentMode}
            onChange={e => setConvertForm({ ...convertForm, paymentMode: e.target.value as any })}
          />

          {convertForm.paymentMode === 'qr' && (
            <div className="space-y-4 p-4 border border-slate-900 bg-slate-950/60 rounded-xl">
              <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
                Scan QR Code with scanner terminal. Upload screenshot slips and input bank reference code.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="UPI / Bank Reference Number" required value={convertForm.referenceNumber} onChange={e => setConvertForm({ ...convertForm, referenceNumber: e.target.value })} placeholder="REF-897451203" />
                <Input label="Simulate screenshot proof file" type="file" onChange={e => setConvertForm({ ...convertForm, screenshotFile: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=300&h=200' })} className="file:bg-slate-900 file:border-slate-800 file:text-slate-400 file:text-[10px] file:font-black file:rounded file:px-2" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <Button variant="outline" size="sm" onClick={() => setIsConverting(false)} className="text-xs">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" className="text-xs px-4! bg-emerald-600 hover:bg-emerald-500 border-emerald-500">Confirm conversion</Button>
          </div>
        </form>
      </Dialog>

      {/* Generated Credentials Alert Modal */}
      <Dialog isOpen={isShowingCreds} onClose={() => setIsShowingCreds(false)} title="Gym Access Credentials Generated">
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            The membership has been registered. The following access profile was automatically generated in mock authentication:
          </p>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Email Username</span>
              <span className="text-slate-100 font-bold select-all">{generatedCreds?.email}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Secure Password</span>
              <span className="text-blue-400 font-bold select-all">{generatedCreds?.pass}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsShowingCreds(false)} className="text-xs px-5!">Close window</Button>
          </div>
        </div>
      </Dialog>
    </PageLayout>
  );
}

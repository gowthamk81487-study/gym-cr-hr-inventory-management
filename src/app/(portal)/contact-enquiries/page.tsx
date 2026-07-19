'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Mail, Search, Clock, CheckCircle2, XCircle, MoreVertical, Eye, Trash2, Edit2, FileDown, UserCheck, AlertTriangle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import { enquiryService, clientService, authService } from '@/services';
import { EnquiryRecord } from '@/services/db';
import { exportData } from '@/utils/export';

export default function ContactEnquiriesPage() {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Overlays
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedManager, setAssignedManager] = useState('Alex Pierce');

  const loadData = async () => {
    try {
      const list = await enquiryService.getAll();
      setEnquiries(list);
    } catch {
      showToast('Error loading enquiries queue.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone.includes(searchQuery);

      const matchStatus = filterStatus === 'all' || e.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [enquiries, searchQuery, filterStatus]);

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      const updated = enquiries.map(e => (e.id === id ? { ...e, status } : e));
      await enquiryService.save(updated);
      setEnquiries(updated);
      showToast(`Enquiry status changed to ${status}`, 'success');
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status });
      }
    } catch {
      showToast('Error updating status.', 'error');
    }
  };

  const handleAssignManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      const updated = enquiries.map(enq => {
        if (enq.id === selectedEnquiry.id) {
          return {
            ...enq,
            assignedManager: assignedManager,
            status: 'in_progress' as const
          };
        }
        return enq;
      });
      await enquiryService.save(updated);
      setEnquiries(updated);
      setIsAssigning(false);
      showToast(`Assigned manager ${assignedManager} to enquiry.`, 'success');
      loadData();
    } catch {
      showToast('Assignment failed.', 'error');
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    try {
      const updated = enquiries.filter(e => e.id !== id);
      await enquiryService.save(updated);
      setEnquiries(updated);
      setIsViewing(false);
      setSelectedEnquiry(null);
      showToast('Enquiry deleted successfully.', 'success');
    } catch {
      showToast('Deletion failed.', 'error');
    }
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (filteredEnquiries.length === 0) {
      showToast('No data available to export.', 'error');
      return;
    }

    const headers = ['Enquiry ID', 'Full Name', 'Email Address', 'Phone Number', 'Target Branch', 'Message Body', 'Status', 'Date Received'];
    const rows = filteredEnquiries.map(e => [
      e.id,
      e.name,
      e.email,
      e.phone,
      e.branch,
      e.message,
      e.status,
      e.createdDate
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Enquiries_Report_${dateStr}`;

    if (format === 'csv') {
      exportData.toCSV(filename, headers, rows);
      showToast('Exporting to CSV initiated.', 'success');
    } else if (format === 'xlsx') {
      exportData.toExcel(filename, headers, rows);
      showToast('Exporting to Excel initiated.', 'success');
    } else if (format === 'pdf') {
      exportData.toPDF('Member Contact Enquiries Queue', headers, rows, filename);
      showToast('Exporting to PDF print initiated.', 'success');
    }
  };

  return (
    <PageLayout
      title="Contact Enquiries Queue"
      description="Monitor marketing website submissions, assign operational managers, and filter member leads."
    >
      <div className="space-y-6 py-2 text-left">
        {/* KPI metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total Enquiries" value={enquiries.length} icon={Mail} change="Total submissions logged" />
          <StatCard title="New Leads" value={enquiries.filter(e => e.status === 'new').length} icon={Clock} change="Awaiting operational review" changeType="increase" />
          <StatCard title="Converted Members" value={enquiries.filter(e => e.status === 'converted').length} icon={CheckCircle2} change="Converted to active member profiles" changeType="increase" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
              />
            </div>
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'new', label: 'New' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'replied', label: 'Replied' },
                { value: 'closed', label: 'Closed' },
                { value: 'converted', label: 'Converted' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>

          <div className="flex gap-2 self-stretch sm:self-auto justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="text-xs border-slate-850 hover:text-white">PDF</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} className="text-xs border-slate-850 hover:text-white">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="text-xs border-slate-850 hover:text-white">CSV</Button>
          </div>
        </div>

        {/* Data Grid */}
        <Card className="border-slate-900">
          <CardHeader title="Website Contact Submissions" description="Review enquiries submitted via the front-facing website portals." />
          <CardContent className="p-0">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Enquiry ID</th>
                    <th className="p-3">Sender Name</th>
                    <th className="p-3">Preferred Branch</th>
                    <th className="p-3 font-mono">Date Received</th>
                    <th className="p-3">Assigned Manager</th>
                    <th className="p-3">Lead Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredEnquiries.map(enq => (
                    <tr key={enq.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-slate-500">{enq.id}</td>
                      <td className="p-3 font-bold text-slate-200">
                        <div>
                          <p>{enq.name}</p>
                          <span className="text-[9.5px] text-slate-500 font-mono block">{enq.email} • {enq.phone}</span>
                        </div>
                      </td>
                      <td className="p-3 uppercase text-[10px] text-blue-400 font-black">{enq.branch}</td>
                      <td className="p-3 font-mono text-slate-500">{enq.createdDate}</td>
                      <td className="p-3 text-slate-400">{enq.assignedManager || 'Unassigned'}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            enq.status === 'new' ? 'warning' :
                            enq.status === 'converted' ? 'emerald' :
                            enq.status === 'rejected' ? 'rose' : 'slate'
                          }
                        >
                          {enq.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setIsViewing(true);
                          }}
                          className="text-[10px] py-1 border-slate-800 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setIsAssigning(true);
                          }}
                          className="text-[10px] py-1 border-slate-800 hover:text-white"
                        >
                          Assign
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEnquiry(enq.id)}
                          className="text-[10px] py-1 border-slate-800 text-rose-500 hover:bg-rose-500/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEnquiries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No contact enquiries received.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 1. View Message Modal */}
      {selectedEnquiry && (
        <Dialog isOpen={isViewing} onClose={() => { setIsViewing(false); setSelectedEnquiry(null); }} title={`Enquiry Message: ${selectedEnquiry.id}`}>
          <div className="space-y-4 pt-2 text-left text-xs font-semibold">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Sender Name:</span>
                <p className="text-slate-200 font-bold text-sm mt-0.5">{selectedEnquiry.name}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Date Received:</span>
                <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.createdDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Email Address:</span>
                <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.email}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Phone Number:</span>
                <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.phone || 'N/A'}</p>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Target Preferred Branch:</span>
              <p className="text-blue-400 font-black mt-0.5 uppercase">{selectedEnquiry.branch} branch</p>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Message Body:</span>
              <p className="p-3 bg-slate-950/60 border border-slate-900 text-slate-300 leading-relaxed font-medium rounded-xl">
                {selectedEnquiry.message}
              </p>
            </div>

            <div className="border-t border-slate-900 pt-3 grid grid-cols-2 gap-4">
              <Select
                label="Update Lead Status"
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'replied', label: 'Replied' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                value={selectedEnquiry.status}
                onChange={e => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-900">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                className="text-rose-500 border-slate-800 hover:bg-rose-500/5 text-[11px]"
              >
                Delete Enquiry
              </Button>
              <Button variant="primary" size="sm" onClick={() => { setIsViewing(false); setSelectedEnquiry(null); }} className="text-xs px-4!">
                Close View
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* 2. Assign Manager Dialog */}
      {selectedEnquiry && (
        <Dialog isOpen={isAssigning} onClose={() => setIsAssigning(false)} title="Assign Account Manager">
          <form onSubmit={handleAssignManagerSubmit} className="space-y-4 pt-2 text-left">
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
              <Button variant="outline" size="sm" onClick={() => setIsAssigning(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
                Assign Clearance
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </PageLayout>
  );
}

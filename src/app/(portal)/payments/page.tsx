'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, Search, Check, X, Eye, FileDown, ShieldAlert, Image, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import PageLayout from '@/layouts/PageLayout';
import { paymentService, authService, clientService } from '@/services';
import { MockPaymentRecord } from '@/services/index';
import { Client } from '@/types';
import Select from '@/components/ui/Select';

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<MockPaymentRecord[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal inspection
  const [selectedPayment, setSelectedPayment] = useState<MockPaymentRecord | null>(null);
  const [isViewingProof, setIsViewingProof] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      const list = await paymentService.getAll();
      setPayments(list);
    } catch {
      showToast('Error loading payment ledger.', 'error');
    }
  };

  useEffect(() => {
    const cur = authService.getCurrentUser();
    setCurrentUser(cur);
    if (cur) {
      setRole(cur.role);
    }
    fetchPayments();
  }, []);

  const handleVerifyProof = async (id: string, status: 'paid' | 'failed') => {
    setIsLoading(true);
    try {
      const list = await paymentService.getAll();
      const item = list.find(p => p.id === id);
      if (!item) throw new Error('Payment not found.');

      item.status = status;
      await paymentService.update(item);

      // If approved, verify and update the client's status/paymentStatus in clients collection
      if (status === 'paid') {
        const clients = await clientService.getAll();
        const client = clients.find(c => c.id === item.clientId);
        if (client) {
          client.paymentStatus = 'paid';
          if (client.status === 'pending') {
            client.status = 'active'; // Onboard starter program / active
          }
          await clientService.update(client);
        }
      }

      showToast(`Payment proof ${status === 'paid' ? 'Approved' : 'Rejected'}!`, 'success');
      setIsViewingProof(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (err: any) {
      showToast(err.message || 'Error updating payment status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = useMemo(() => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const pendingVerification = useMemo(() => {
    return payments.filter(p => p.status === 'pending' && p.paymentMethod === 'qr');
  }, [payments]);

  // Client view of their own payment history
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Role filter
      if (role === 'client' && p.clientId !== currentUser?.entityId) {
        return false;
      }
      
      const matchSearch =
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMode = filterMode === 'all' || p.paymentMethod === filterMode;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchSearch && matchMode && matchStatus;
    });
  }, [payments, searchQuery, filterMode, filterStatus, role, currentUser]);

  const triggerExport = () => {
    showToast('Exporting transaction audit spreadsheet...', 'info');
    setTimeout(() => {
      showToast('Spreadsheet download compiled.', 'success');
    }, 1200);
  };

  return (
    <PageLayout
      title={role === 'client' ? 'My Payment History' : 'Payment Ledger & Billing'}
      description={role === 'client' ? 'Overview of your membership subscription receipts.' : 'Track Cash, UPI, Card, Gateway, and QR payment verifications.'}
      actions={
        role !== 'client' && (
          <Button variant="outline" size="sm" onClick={triggerExport} className="text-xs py-1.5 px-3! border-slate-800 text-slate-400 hover:text-white">
            <FileDown className="h-4 w-4" /> Export Spreadsheet
          </Button>
        )
      }
    >
      <div className="space-y-6 py-2">
        {/* KPI stats */}
        {role !== 'client' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard title="Total Cashflow Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} change="Verified paid ledgers" />
            <StatCard title="Pending QR Verification" value={pendingVerification.length} icon={Clock} change="Receipt proofs awaiting audit" changeType={pendingVerification.length > 0 ? 'decrease' : 'neutral'} />
            <StatCard title="Cleared Payments count" value={payments.filter(p => p.status === 'paid').length} icon={CheckCircle2} change="Total cleared transactions" />
          </div>
        )}

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/10 border border-slate-900 rounded-xl p-4">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder={role === 'client' ? "Search by reference or ID..." : "Search by client name, ID, reference..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select
              options={[
                { value: 'all', label: 'All Modes' },
                { value: 'cash', label: 'Cash' },
                { value: 'upi', label: 'UPI Direct' },
                { value: 'credit_card', label: 'Card Swipe' },
                { value: 'gateway', label: 'Stripe Gateway' },
                { value: 'qr', label: 'QR Scanner Proof' }
              ]}
              value={filterMode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterMode(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'paid', label: 'Approved (Paid)' },
                { value: 'pending', label: 'Pending Audit' },
                { value: 'failed', label: 'Rejected (Failed)' }
              ]}
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            />
          </div>
        </div>

        {/* Verification Queue for Admin (QR slips) */}
        {role !== 'client' && pendingVerification.length > 0 && (
          <Card className="border-amber-500/15 bg-amber-500/5">
            <CardHeader title="Pending QR Verification Queue" description="Verify bank reference slips and approve account setup." />
            <CardContent className="divide-y divide-slate-900/60 text-xs">
              {pendingVerification.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="font-bold text-slate-200">{p.clientName} ({p.clientId})</p>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Reference No: {p.referenceNumber || 'N/A'} • Amount: ${p.amount} • {p.membershipName}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(p);
                      setIsViewingProof(true);
                    }}
                    className="text-[10px] py-1 border-slate-800 text-blue-400 hover:text-blue-300 font-bold"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Proof
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Ledger Table */}
        <Card className="border-slate-900">
          <CardHeader title="Transaction Ledger logs" description="Audit trails for memberships, PT packages, and starter bundles." />
          <CardContent className="p-0">
            <div className="table-container text-[11px] font-semibold text-slate-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 uppercase tracking-wider text-[9px] border-b border-slate-900">
                    <th className="p-3">Receipt ID</th>
                    {role !== 'client' && <th className="p-3">Client Member</th>}
                    <th className="p-3">Plan / Bundle</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Reference No</th>
                    <th className="p-3 font-mono">Amount</th>
                    <th className="p-3">Status</th>
                    {role !== 'client' && <th className="p-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="table-row-hover text-slate-300">
                      <td className="p-3 font-mono text-[10px] text-slate-500">{p.id}</td>
                      {role !== 'client' && <td className="p-3 font-bold text-slate-200">{p.clientName}</td>}
                      <td className="p-3">{p.membershipName}</td>
                      <td className="p-3 uppercase text-[9.5px] text-blue-400">{p.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-3 font-mono text-slate-500">{p.referenceNumber || '—'}</td>
                      <td className="p-3 font-mono text-emerald-400">${p.amount}</td>
                      <td className="p-3">
                        <Badge variant={p.status === 'paid' ? 'emerald' : p.status === 'pending' ? 'warning' : 'rose'}>
                          {p.status}
                        </Badge>
                      </td>
                      {role !== 'client' && (
                        <td className="p-3 text-right">
                          {p.paymentMethod === 'qr' && p.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerifyProof(p.id, 'paid')}
                                className="p-1 text-emerald-400 hover:text-emerald-300 border-slate-800"
                              >
                                <Check className="h-4.5 w-4.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerifyProof(p.id, 'failed')}
                                className="p-1 text-rose-400 hover:text-rose-300 border-slate-800"
                              >
                                <X className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-bold uppercase">Audited</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={role === 'client' ? 7 : 8} className="p-6 text-center text-slate-500">
                        No transactions registered in payment ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proof Inspector Dialog Overlay */}
      {selectedPayment && (
        <Dialog isOpen={isViewingProof} onClose={() => setIsViewingProof(false)} title="Verify QR Payment Slip">
          <div className="space-y-4 pt-2">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/60 text-xs text-slate-300 space-y-2">
              <p><strong>Member Name:</strong> {selectedPayment.clientName}</p>
              <p><strong>Amount Remitted:</strong> ${selectedPayment.amount}</p>
              <p><strong>Bank Reference:</strong> {selectedPayment.referenceNumber}</p>
            </div>

            {/* Slip image display mockup */}
            <div className="h-64 bg-slate-950 border border-slate-900 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2 overflow-hidden relative">
              {selectedPayment.screenshotProof ? (
                <img src={selectedPayment.screenshotProof} alt="QR Slip Receipt" className="w-full h-full object-contain" />
              ) : (
                <>
                  <Image className="h-10 w-10 text-slate-700 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Simulated QR Proof Screenshot</span>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVerifyProof(selectedPayment.id, 'failed')}
                disabled={isLoading}
                className="text-xs text-rose-400 hover:text-rose-300 border-slate-800"
              >
                Reject Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVerifyProof(selectedPayment.id, 'paid')}
                isLoading={isLoading}
                className="text-xs px-4! bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              >
                Approve Payment
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </PageLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, MailOpen, Filter, Trash2, ShieldAlert, Sparkles, UserPlus, CreditCard, Clock, Activity } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { notificationService, authService, enquiryService } from '@/services';
import { NotificationRecord, EnquiryRecord } from '@/services/db';
import Dialog from '@/components/ui/Dialog';
import Select from '@/components/ui/Select';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [role, setRole] = useState<string | null>(null);

  // Enquiry detail modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isViewingEnquiry, setIsViewingEnquiry] = useState(false);

  const fetchNotifications = async () => {
    try {
      const list = await notificationService.getAll();
      setNotifications(list);
    } catch {
      showToast('Error fetching alerts feed.', 'error');
    }
  };

  useEffect(() => {
    const cur = authService.getCurrentUser();
    if (cur) {
      setRole(cur.role);
    }
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    showToast('Notification marked as read.', 'success');
  };

  const handleNotificationClick = async (notif: NotificationRecord) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.enquiryId) {
      try {
        const enqList = await enquiryService.getAll();
        const found = enqList.find(e => e.id === notif.enquiryId);
        if (found) {
          setSelectedEnquiry(found);
          setIsViewingEnquiry(true);
        } else {
          showToast('Enquiry record could not be found.', 'error');
        }
      } catch {
        showToast('Error retrieving enquiry details.', 'error');
      }
    }
  };

  const handleUpdateEnquiryStatus = async (status: any) => {
    if (!selectedEnquiry) return;
    try {
      const enqList = await enquiryService.getAll();
      const updated = enqList.map(e => e.id === selectedEnquiry.id ? { ...e, status } : e);
      await enquiryService.save(updated);
      setSelectedEnquiry({ ...selectedEnquiry, status });
      showToast('Enquiry status updated.', 'success');
      fetchNotifications();
    } catch {
      showToast('Error updating status.', 'error');
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!selectedEnquiry) return;
    try {
      const enqList = await enquiryService.getAll();
      const updated = enqList.filter(e => e.id !== selectedEnquiry.id);
      await enquiryService.save(updated);
      setIsViewingEnquiry(false);
      setSelectedEnquiry(null);
      showToast('Enquiry record deleted.', 'success');
      fetchNotifications();
    } catch {
      showToast('Error deleting enquiry.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    showToast('All notifications marked as read.', 'success');
  };

  const filteredNotifications = notifications.filter(n => {
    // Role filter
    if (role === 'client' && n.targetUserId && n.targetUserId !== authService.getCurrentUser()?.email) {
      return false;
    }
    if (role === 'coach' && n.targetRole === 'super_admin') {
      return false;
    }
    
    // Type filter
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4.5 w-4.5 text-emerald-500" />;
      case 'warning':
        return <Clock className="h-4.5 w-4.5 text-amber-500" />;
      case 'error':
        return <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-blue-500" />;
    }
  };

  return (
    <PageLayout
      title="Alerts & System Notifications"
      description="Access security alerts, biometric updates, and club onboarding logs."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs py-1.5 px-3.5! flex items-center gap-1.5 border-slate-800 text-slate-400 hover:text-white"
          >
            <MailOpen className="h-4 w-4" /> Mark All Read
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Filtering Options */}
        <div className="flex flex-wrap border-b border-slate-900 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider pb-px">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'info', label: 'Info Updates' },
            { id: 'success', label: 'Success Events' },
            { id: 'warning', label: 'Warnings' },
            { id: 'error', label: 'Critical Errors' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`pb-2.5 px-1 border-b-2 cursor-pointer transition-colors ${
                filterType === tab.id
                  ? 'border-blue-500 text-slate-100'
                  : 'border-transparent hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <Card className="border-slate-900">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-900/60">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-900/40 ${
                    notif.read ? 'bg-transparent opacity-60' : 'bg-slate-900/20'
                  }`}
                >
                  {/* Icon Indicator */}
                  <div className={`h-8 w-8 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center shrink-0`}>
                    {getAlertIcon(notif.type)}
                  </div>

                  {/* Message Detail */}
                  <div className="flex-1 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">{notif.message}</p>
                    <span className="text-[9px] text-slate-600 font-bold block uppercase tracking-wider">
                      {new Date(notif.date).toLocaleString()}
                    </span>
                  </div>

                  {/* Mark single as read */}
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-900 shrink-0 self-center text-slate-500 hover:text-slate-300"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No active system alerts matched filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEnquiry && (
        <Dialog isOpen={isViewingEnquiry} onClose={() => { setIsViewingEnquiry(false); setSelectedEnquiry(null); }} title={`Enquiry Details: ${selectedEnquiry.id}`}>
          <div className="space-y-4 pt-2 text-left text-xs font-semibold">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">From Name:</p>
                <p className="text-slate-200 font-bold mt-0.5">{selectedEnquiry.name}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Target Branch:</p>
                <p className="text-blue-400 font-bold mt-0.5 uppercase">{selectedEnquiry.branch}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Email Address:</p>
                <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.email}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Phone Number:</p>
                <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.phone || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Subject:</p>
              <p className="text-slate-200 font-bold mt-0.5">Membership Inquiry - {selectedEnquiry.branch.toUpperCase()} Branch</p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Submission Date & Time:</p>
              <p className="text-slate-300 font-mono mt-0.5">{selectedEnquiry.createdDate}</p>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Message Details:</p>
              <p className="text-slate-400 leading-relaxed p-3 bg-slate-950/40 border border-slate-900 rounded-xl font-semibold">
                {selectedEnquiry.message}
              </p>
            </div>

            <div className="border-t border-slate-900 pt-3 grid grid-cols-2 gap-4">
              <Select
                label="Enquiry Status"
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'replied', label: 'Replied' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                value={selectedEnquiry.status}
                onChange={e => handleUpdateEnquiryStatus(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-900">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteEnquiry}
                className="text-rose-500 hover:bg-rose-500/5 text-[11px] flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Delete Enquiry
              </Button>
              <Button variant="primary" size="sm" onClick={() => { setIsViewingEnquiry(false); setSelectedEnquiry(null); }} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </PageLayout>
  );
}

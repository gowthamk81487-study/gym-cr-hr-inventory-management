'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, MailOpen, Filter, Trash2, ShieldAlert, Sparkles, UserPlus, CreditCard, Clock, Activity } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { notificationService, authService } from '@/services';
import { NotificationRecord } from '@/services/db';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [role, setRole] = useState<string | null>(null);

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
                  className={`p-4 flex items-start gap-4 transition-colors ${
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
                      onClick={() => handleMarkAsRead(notif.id)}
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
    </PageLayout>
  );
}

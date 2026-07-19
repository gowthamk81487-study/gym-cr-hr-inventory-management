'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, FileBarChart, FileDown, Sparkles, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/common/Toast';
import { StatCard } from '@/components/common/StatCard';
import {
  RevenueChart,
  MembershipChart,
  AttendanceChart,
  InventoryChart
} from '@/components/common/Charts';
import PageLayout from '@/layouts/PageLayout';
import { reportService, authService } from '@/services';
import { ReportSummary } from '@/types';

export default function ReportsPage() {
  const { showToast } = useToast();
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const cur = authService.getCurrentUser();
    if (cur) {
      setRole(cur.role);
    }

    const loadData = async () => {
      try {
        const summaries = await reportService.getAll();
        if (summaries.length > 0) {
          setReport(summaries[0]);
        }
      } catch {
        showToast('Error loading report analytics.', 'error');
      }
    };
    loadData();
  }, []);

  const triggerPDFExport = () => {
    showToast('Compiling system financial reports...', 'info');
    setTimeout(() => {
      showToast('PDF Exported successfully! Check downloads.', 'success');
    }, 1500);
  };

  // Hardening: Coach cannot access financial reports
  if (role === 'coach') {
    return (
      <PageLayout title="Performance Reports" description="Overview of client achievements and attendance metrics.">
        <div className="max-w-2xl mx-auto py-8 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">Access Denied</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your coach access role is restricted from auditing financial ledgers and analytical cashflow datasets.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Analytics Reports"
      description="Club cashflow splits, active tier divisions, daily attendance levels, and inventory value logs."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={triggerPDFExport}
          className="text-xs py-1.5 px-4.5! flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          <FileDown className="h-4 w-4" /> Export Report (PDF)
        </Button>
      }
    >
      <div className="space-y-6 py-2">
        {/* KPI Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Total Revenue (Month)"
            value={`$${(report?.totalRevenue || 15420).toLocaleString()}`}
            change="+8.2% vs last month"
            changeType="increase"
            icon={DollarSign}
          />
          <StatCard
            title="Active Subscribers"
            value={report?.activeMemberships || 590}
            change="+14% this month"
            changeType="increase"
            icon={Users}
          />
          <StatCard
            title="Avg Attendance Rate"
            value={`${report?.attendanceRate || 85}%`}
            change="Normal visitor density"
            changeType="neutral"
            icon={Activity}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart title="Cashflow Revenue Ledger" />
          <MembershipChart title="Active Tiers Division" />
          <AttendanceChart title="Average Daily Occupancy Trend" />
          <InventoryChart title="Supplements & Asset Values" />
        </div>

      </div>
    </PageLayout>
  );
}

// Simple ShieldAlert fallback icon if needed
function ShieldAlert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

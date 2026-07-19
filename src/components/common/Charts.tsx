'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { db } from '@/services/db';

// Hook to check mounting state to avoid SSR hydration mismatches
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

// 1. Revenue Chart (Area Chart)
interface RevenueDataPoint {
  month: string;
  revenue: number;
  recurring: number;
}

export const RevenueChart: React.FC<{ data?: RevenueDataPoint[]; title?: string }> = ({
  data,
  title = 'Revenue Statistics'
}) => {
  const isMounted = useIsMounted();

  const chartData = useMemo(() => {
    if (data) return data;
    try {
      const payments = db.getCollection<any>('gym_payments');
      const approved = payments.filter((p: any) => p.status === 'paid' || p.status === 'approved');
      if (approved.length === 0) return [];

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const grouped = months.map(m => ({ month: m, revenue: 0, recurring: 0 }));

      approved.forEach((p: any) => {
        const d = new Date(p.date || p.createdDate);
        if (d.getFullYear() === currentYear) {
          const mIdx = d.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            grouped[mIdx].revenue += Number(p.amount);
            if (p.membershipName && p.membershipName !== 'One-time') {
              grouped[mIdx].recurring += Number(p.amount);
            }
          }
        }
      });
      return grouped.slice(0, new Date().getMonth() + 1);
    } catch {
      return [];
    }
  }, [data]);

  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  const hasData = chartData.length > 0 && chartData.some(d => d.revenue > 0);

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Monthly cashflow and subscription metrics" />
      <CardContent className="h-64 flex flex-col justify-center items-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#030712',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Total Sales"
              />
              <Area
                type="monotone"
                dataKey="recurring"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRecurring)"
                name="Subscriptions"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-500 font-semibold text-xs space-y-1 p-6">
            <p>No revenue data recorded for charting.</p>
            <span className="text-[10px] text-slate-600 font-medium block">Approved member transactions will plot financial trends here.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 2. Membership Distribution Chart (Donut Chart)
interface MembershipDataPoint {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#10b981', '#a855f7'];

export const MembershipChart: React.FC<{ data?: MembershipDataPoint[]; title?: string }> = ({
  data,
  title = 'Membership Distribution'
}) => {
  const isMounted = useIsMounted();

  const chartData = useMemo(() => {
    if (data) return data;
    try {
      const clients = db.getCollection<any>('gym_clients');
      const memberships = db.getCollection<any>('gym_memberships');
      
      const counts: Record<string, number> = {};
      clients.forEach((c: any) => {
        const pId = c.membershipId;
        const name = pId ? (memberships.find((m: any) => m.id === pId)?.name || pId) : 'Standard';
        counts[name] = (counts[name] || 0) + 1;
      });
      
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } catch {
      return [];
    }
  }, [data]);

  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  const hasData = chartData.length > 0;

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Breakdown of active plan subscriptions" />
      <CardContent className="h-64 flex flex-col justify-center items-center">
        {hasData ? (
          <>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#030712',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-2 text-xs font-semibold text-slate-400">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 font-semibold text-xs space-y-1 p-6">
            <p>No active tier divisions.</p>
            <span className="text-[10px] text-slate-600 font-medium block">Configure plans and register clients to plot divisions.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 3. Daily Attendance Chart (Bar Chart)
interface AttendanceDataPoint {
  day: string;
  checkins: number;
}

export const AttendanceChart: React.FC<{ data?: AttendanceDataPoint[]; title?: string }> = ({
  data,
  title = 'Daily Attendance Patterns'
}) => {
  const isMounted = useIsMounted();

  const chartData = useMemo(() => {
    if (data) return data;
    try {
      const logs = db.getCollection<any>('gym_attendance');
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      
      logs.forEach((l: any) => {
        const d = new Date(l.checkIn);
        const dayIdx = d.getDay();
        counts[dayIdx]++;
      });
      
      return [
        { day: 'Mon', checkins: counts[1] },
        { day: 'Tue', checkins: counts[2] },
        { day: 'Wed', checkins: counts[3] },
        { day: 'Thu', checkins: counts[4] },
        { day: 'Fri', checkins: counts[5] },
        { day: 'Sat', checkins: counts[6] },
        { day: 'Sun', checkins: counts[0] }
      ];
    } catch {
      return [];
    }
  }, [data]);

  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  const hasData = chartData.length > 0 && chartData.some(d => d.checkins > 0);

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Average check-ins per day of the week" />
      <CardContent className="h-64 flex flex-col justify-center items-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                contentStyle={{
                  backgroundColor: '#030712',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="checkins" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.day === 'Sat' || entry.day === 'Fri' ? '#10b981' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-500 font-semibold text-xs space-y-1 p-6">
            <p>No check-in occupancy log registered.</p>
            <span className="text-[10px] text-slate-600 font-medium block">Client check-ins will display daily attendance patterns here.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 4. Inventory Stock Chart (Stacked Bar Chart)
interface InventoryDataPoint {
  category: string;
  inStock: number;
  lowStock: number;
}

export const InventoryChart: React.FC<{ data?: InventoryDataPoint[]; title?: string }> = ({
  data,
  title = 'Inventory Levels'
}) => {
  const isMounted = useIsMounted();

  const chartData = useMemo(() => {
    if (data) return data;
    try {
      const prds = db.getCollection<any>('gym_products');
      const cats: Record<string, { category: string; inStock: number; lowStock: number }> = {};
      
      prds.forEach((p: any) => {
        const catName = p.category === 'supplements' ? 'Supplements' : p.category === 'merchandise' ? 'Apparel' : p.category === 'cafe' ? 'Beverages' : 'Equipment';
        if (!cats[catName]) {
          cats[catName] = { category: catName, inStock: 0, lowStock: 0 };
        }
        if (p.currentStock <= p.minStock) {
          cats[catName].lowStock += p.currentStock;
        } else {
          cats[catName].inStock += p.currentStock;
        }
      });
      return Object.values(cats);
    } catch {
      return [];
    }
  }, [data]);

  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  const hasData = chartData.length > 0 && chartData.some(d => d.inStock > 0 || d.lowStock > 0);

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Stock levels categorized by product categories" />
      <CardContent className="h-64 flex flex-col justify-center items-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="category"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                contentStyle={{
                  backgroundColor: '#030712',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px'
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="inStock" name="Healthy Stock" stackId="a" fill="#3b82f6" />
              <Bar dataKey="lowStock" name="Restock Alert" stackId="a" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-500 font-semibold text-xs space-y-1 p-6">
            <p>No products registered in catalog.</p>
            <span className="text-[10px] text-slate-600 font-medium block">Register items in the catalog to visualize stock distributions.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

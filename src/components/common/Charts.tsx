'use client';

import React, { useState, useEffect } from 'react';
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

const defaultRevenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 4200, recurring: 3100 },
  { month: 'Feb', revenue: 4900, recurring: 3500 },
  { month: 'Mar', revenue: 5800, recurring: 4200 },
  { month: 'Apr', revenue: 7100, recurring: 5000 },
  { month: 'May', revenue: 8400, recurring: 6200 },
  { month: 'Jun', revenue: 9900, recurring: 7500 }
];

export const RevenueChart: React.FC<{ data?: RevenueDataPoint[]; title?: string }> = ({
  data = defaultRevenueData,
  title = 'Revenue Statistics'
}) => {
  const isMounted = useIsMounted();
  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Monthly cashflow and subscription metrics" />
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      </CardContent>
    </Card>
  );
};

// 2. Membership Distribution Chart (Donut Chart)
interface MembershipDataPoint {
  name: string;
  value: number;
}

const defaultMembershipData: MembershipDataPoint[] = [
  { name: 'Standard Tier', value: 340 },
  { name: 'Elite Tier', value: 180 },
  { name: 'Premium VIP', value: 95 }
];

const COLORS = ['#3b82f6', '#10b981', '#a855f7'];

export const MembershipChart: React.FC<{ data?: MembershipDataPoint[]; title?: string }> = ({
  data = defaultMembershipData,
  title = 'Membership Distribution'
}) => {
  const isMounted = useIsMounted();
  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Breakdown of active plan subscriptions" />
      <CardContent className="h-64 flex flex-col justify-center">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
        
        {/* Customized Legend */}
        <div className="flex justify-center gap-6 mt-2 text-xs font-semibold text-slate-400">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span>{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 3. Daily Attendance Chart (Bar Chart)
interface AttendanceDataPoint {
  day: string;
  checkins: number;
}

const defaultAttendanceData: AttendanceDataPoint[] = [
  { day: 'Mon', checkins: 145 },
  { day: 'Tue', checkins: 160 },
  { day: 'Wed', checkins: 135 },
  { day: 'Thu', checkins: 155 },
  { day: 'Fri', checkins: 180 },
  { day: 'Sat', checkins: 210 },
  { day: 'Sun', checkins: 95 }
];

export const AttendanceChart: React.FC<{ data?: AttendanceDataPoint[]; title?: string }> = ({
  data = defaultAttendanceData,
  title = 'Daily Attendance Patterns'
}) => {
  const isMounted = useIsMounted();
  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Average check-ins per day of the week" />
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.day === 'Sat' || entry.day === 'Fri' ? '#10b981' : '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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

const defaultInventoryData: InventoryDataPoint[] = [
  { category: 'Supplements', inStock: 120, lowStock: 15 },
  { category: 'Beverages', inStock: 250, lowStock: 45 },
  { category: 'Apparel', inStock: 80, lowStock: 5 },
  { category: 'Equipment', inStock: 45, lowStock: 2 }
];

export const InventoryChart: React.FC<{ data?: InventoryDataPoint[]; title?: string }> = ({
  data = defaultInventoryData,
  title = 'Inventory Levels'
}) => {
  const isMounted = useIsMounted();
  if (!isMounted) return <div className="h-64 bg-slate-950/20 animate-pulse rounded-xl" />;

  return (
    <Card className="border-slate-900">
      <CardHeader title={title} description="Stock levels categorized by product categories" />
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            <Bar dataKey="inStock" stackId="a" fill="#10b981" name="Healthy Stock" radius={[0, 0, 0, 0]} maxBarSize={30} />
            <Bar dataKey="lowStock" stackId="a" fill="#f43f5e" name="Low Stock Alert" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

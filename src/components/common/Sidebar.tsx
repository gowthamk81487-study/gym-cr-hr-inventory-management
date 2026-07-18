'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  UserCheck,
  History,
  Flame,
  Utensils,
  CreditCard,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  X,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badgeKey?: string;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const sections: SidebarSection[] = [
    {
      title: 'Core Panel',
      links: [
        { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Alert Feed', href: '/notifications', icon: Bell, badgeKey: 'unreadNotifications' },
        { label: 'Analytics Reports', href: '/reports', icon: BarChart3 },
        { label: 'System Settings', href: '/settings', icon: Settings },
      ]
    },
    {
      title: 'Client Management (CRM)',
      links: [
        { label: 'Client Database', href: '/clients', icon: Users },
        { label: 'Coach Roster', href: '/coaches', icon: Dumbbell },
        { label: 'Interactive Matching', href: '/coach-assignment', icon: UserCheck },
        { label: 'Transfer Records', href: '/coach-transfer', icon: History },
      ]
    },
    {
      title: 'Fitness & Memberships',
      links: [
        { label: 'Workout Protocols', href: '/workouts', icon: Zap },
        { label: 'Nutrition Schedules', href: '/diets', icon: Utensils },
        { label: 'Membership Tiers', href: '/memberships', icon: CreditCard },
      ]
    },
    {
      title: 'Operations',
      links: [
        { label: 'HR Administration', href: '/hr', icon: ShieldCheck },
        { label: 'Club Inventory', href: '/inventory', icon: Package },
        { label: 'Payment Ledger', href: '/payments', icon: DollarSign },
      ]
    }
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-900 flex flex-col transition-transform duration-300 desktop:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900 bg-slate-950/50">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Dumbbell className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Gym HR</h1>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                Provolution
              </span>
            </div>
          </Link>
          
          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="desktop:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                {section.title}
              </h4>
              <ul className="space-y-0.5">
                {section.links.map((link, lIdx) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 group',
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10 border border-blue-500/20'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4.5 w-4.5 transition-transform group-hover:scale-105 duration-200',
                            isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        <span className="flex-1">{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Brand Label */}
        <div className="p-4 border-t border-slate-900 text-center">
          <p className="text-[10px] text-slate-600 font-medium">
            Provolution Technologies © 2026
          </p>
          <p className="text-[8px] text-slate-700 tracking-wider font-semibold uppercase mt-0.5">
            Portal v1.0.0 (MVP)
          </p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;

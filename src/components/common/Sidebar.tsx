'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  UserCheck,
  History,
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
import { authService } from '@/services';
import Logo from '@/components/common/Logo';

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
  const [role, setRole] = useState<'super_admin' | 'manager' | 'coach' | 'client' | null>(null);

  useEffect(() => {
    const cur = authService.getCurrentUser();
    if (cur) {
      setRole(cur.role);
    }
  }, []);

  // Define full sections list and filter based on role
  const getFilteredSections = (): SidebarSection[] => {
    if (!role) return [];

    if (role === 'client') {
      return [
        {
          title: 'Client Portal',
          links: [
            { label: 'Client Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'My Alerts', href: '/notifications', icon: Bell },
            { label: 'My Settings', href: '/settings', icon: Settings },
          ]
        },
        {
          title: 'My Fitness Hub',
          links: [
            { label: 'My Workouts', href: '/workouts', icon: Zap },
            { label: 'My Diets', href: '/diets', icon: Utensils },
            { label: 'My Membership', href: '/memberships', icon: CreditCard },
            { label: 'Personal Training', href: '/personal-training', icon: Dumbbell },
          ]
        },
        {
          title: 'Services',
          links: [
            { label: 'My Attendance', href: '/attendance', icon: UserCheck },
            { label: 'Product Purchase', href: '/product-purchase', icon: Package },
            { label: 'Payment History', href: '/payments', icon: DollarSign },
          ]
        }
      ];
    }

    if (role === 'coach') {
      return [
        {
          title: 'Coach Panel',
          links: [
            { label: 'Coach Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Alert Feed', href: '/notifications', icon: Bell },
            { label: 'System Settings', href: '/settings', icon: Settings },
          ]
        },
        {
          title: 'Client Management',
          links: [
            { label: 'My Clients', href: '/clients', icon: Users },
            { label: 'My Profile', href: '/coaches', icon: Dumbbell },
            { label: 'Personal Training', href: '/personal-training', icon: Zap },
          ]
        },
        {
          title: 'Training & Diet',
          links: [
            { label: 'Workout Templates', href: '/workouts', icon: Zap },
            { label: 'Diet Templates', href: '/diets', icon: Utensils },
          ]
        },
        {
          title: 'Operations',
          links: [
            { label: 'Review Attendance', href: '/attendance', icon: UserCheck },
          ]
        }
      ];
    }

    // Manager and Super Admin share administrative sidebar
    return [
      {
        title: 'Core Panel',
        links: [
          { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Alert Feed', href: '/notifications', icon: Bell },
          { label: 'Analytics Reports', href: '/reports', icon: BarChart3 },
          { label: 'System Settings', href: '/settings', icon: Settings },
        ]
      },
      {
        title: 'Client CRM & Roster',
        links: [
          { label: 'Client Database', href: '/clients', icon: Users },
          { label: 'Coach Roster', href: '/coaches', icon: Dumbbell },
          { label: 'Managers Registry', href: '/managers', icon: ShieldCheck },
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
          { label: 'Personal Training', href: '/personal-training', icon: Dumbbell },
        ]
      },
      {
        title: 'Operations',
        links: [
          { label: 'HR Administration', href: '/hr', icon: ShieldCheck },
          { label: 'Contact Enquiries', href: '/contact-enquiries', icon: Bell },
          { label: 'Member Attendance', href: '/attendance', icon: UserCheck },
          { label: 'Club Inventory', href: '/inventory', icon: Package },
          { label: 'Product Purchase', href: '/product-purchase', icon: Package },
          { label: 'Payment Ledger', href: '/payments', icon: DollarSign },
        ]
      }
    ];
  };

  const sections = getFilteredSections();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-900 flex flex-col transition-transform duration-300 desktop:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900 bg-slate-950/50">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo className="h-8 w-8" />
            <div>
              <h1 className="text-xs font-bold text-white leading-none">The Gym</h1>
              <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                Fitness Club
              </span>
            </div>
          </Link>
          
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
            The Gym Fitness Hub © 2026
          </p>
          <p className="text-[8px] text-slate-700 tracking-wider font-semibold uppercase mt-0.5">
            Enterprise Client Portal
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

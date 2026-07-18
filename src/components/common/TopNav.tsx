'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Bell, LogOut, ShieldAlert } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { notificationService } from '@/services';
import { SystemNotification } from '@/types';

interface TopNavProps {
  onMenuToggle: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const list = await notificationService.getAll();
        setUnreadCount(list.filter(n => !n.read).length);
      } catch {
        // Fallback
        setUnreadCount(2);
      }
    };

    fetchNotifications();

    // Listen to localstorage updates if any
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // Format Pathname into Breadcrumb (e.g., "/coach-assignment" -> "Coach Assignment")
  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Executive Dashboard';
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment) return 'Management Portal';
    
    // Capitalize and replace dashes with spaces
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Left Area: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="desktop:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide">
            {getBreadcrumb()}
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:block">
            Provolution Club Admin
          </p>
        </div>
      </div>

      {/* Right Area: Status, Alerts & User Profile */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            System Online
          </span>
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-600 text-[8px] font-bold text-white flex items-center justify-center border-2 border-slate-950">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-900" />

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <h4 className="text-xs font-bold text-slate-200">Robert Downey Jr.</h4>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              General Manager
            </span>
          </div>
          
          <Avatar
            name="Robert Downey Jr."
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100"
            size="sm"
          />

          {/* Logout button */}
          <Link
            href="/login"
            title="Log Out Portal"
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
export default TopNav;

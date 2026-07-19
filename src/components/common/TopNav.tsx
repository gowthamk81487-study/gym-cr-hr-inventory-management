'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Bell, LogOut, Search, Activity, ShieldAlert, Users, Dumbbell, CreditCard, Package, Utensils, Zap, DollarSign } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { notificationService, authService } from '@/services';
import { db, UserRecord } from '@/services/db';
import { Client, Coach, Membership } from '@/types';
import { GymProduct } from '@/mock/inventory';

interface TopNavProps {
  onMenuToggle: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [profileName, setProfileName] = useState('System Operator');
  const [profileRole, setProfileRole] = useState('Staff');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    category: string;
    items: { label: string; sub: string; path: string; icon: any }[];
  }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const list = await notificationService.getAll();
        setUnreadCount(list.filter(n => !n.read).length);
      } catch {
        setUnreadCount(1);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch logged in user and lookup profiles
  useEffect(() => {
    const cur = authService.getCurrentUser();
    setUser(cur);
    if (cur) {
      if (cur.role === 'super_admin') {
        setProfileName('Gowtham Raj');
        setProfileRole('Super Admin');
      } else if (cur.role === 'manager') {
        setProfileName('Alex Pierce');
        setProfileRole('Manager');
      } else if (cur.role === 'coach') {
        const list = db.getCollection<Coach>('gym_coaches');
        const c = list.find(co => co.id === cur.entityId || co.email === cur.email);
        setProfileName(c ? c.name : 'Coach');
        setProfileRole('Coach');
      } else if (cur.role === 'client') {
        const list = db.getCollection<Client>('gym_clients');
        const cl = list.find(c => c.id === cur.entityId || c.email === cur.email);
        setProfileName(cl ? cl.name : 'Client Member');
        setProfileRole('Club Member');
      }
    }
  }, [pathname]); // Refresh when navigating

  // Handle Search Input Change
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    // 1. Client Search (Restrict based on role)
    if (user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'coach') {
      const clients = db.getCollection<Client>('gym_clients');
      const filteredClients = clients
        .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.phone.includes(q))
        .slice(0, 3)
        .map(c => ({
          label: c.name,
          sub: `Client ID: ${c.id} • ${c.email}`,
          path: `/clients?search=${c.name}`,
          icon: Users
        }));
      if (filteredClients.length > 0) results.push({ category: 'Clients', items: filteredClients });
    }

    // 2. Coach Search
    const coaches = db.getCollection<Coach>('gym_coaches');
    const filteredCoaches = coaches
      .filter(c => c.name.toLowerCase().includes(q) || c.specialization.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({
        label: c.name,
        sub: c.specialization,
        path: `/coaches?search=${c.name}`,
        icon: Dumbbell
      }));
    if (filteredCoaches.length > 0) results.push({ category: 'Coaches', items: filteredCoaches });

    // 3. Membership Search
    if (user?.role !== 'client') {
      const plans = db.getCollection<Membership>('gym_memberships');
      const filteredPlans = plans
        .filter(p => p.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map(p => ({
          label: p.name,
          sub: `$${p.price} • ${p.type} tier`,
          path: `/memberships`,
          icon: CreditCard
        }));
      if (filteredPlans.length > 0) results.push({ category: 'Memberships', items: filteredPlans });
    }

    // 4. Inventory/Supplements Search
    const products = db.getCollection<GymProduct>('gym_products');
    const filteredProducts = products
      .filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 3)
      .map(p => ({
        label: p.name,
        sub: `${p.brand} • ${p.currentStock} in stock`,
        path: `/inventory?search=${p.name}`,
        icon: Package
      }));
    if (filteredProducts.length > 0) results.push({ category: 'Products & Store', items: filteredProducts });

    // 5. Workouts & Diets
    const workouts = db.getCollection<any>('gym_workout_templates');
    const filteredW = workouts
      .filter((w: any) => w.name.toLowerCase().includes(q) || w.goal.toLowerCase().includes(q))
      .slice(0, 2)
      .map((w: any) => ({
        label: w.name,
        sub: `Goal: ${w.goal}`,
        path: `/workouts`,
        icon: Zap
      }));
    if (filteredW.length > 0) results.push({ category: 'Workout Templates', items: filteredW });

    const diets = db.getCollection<any>('gym_diet_templates');
    const filteredD = diets
      .filter((d: any) => d.name.toLowerCase().includes(q) || d.goal.toLowerCase().includes(q))
      .slice(0, 2)
      .map((d: any) => ({
        label: d.name,
        sub: `Goal: ${d.goal}`,
        path: `/diets`,
        icon: Utensils
      }));
    if (filteredD.length > 0) results.push({ category: 'Diet Templates', items: filteredD });

    // 6. Payments Search
    if (user?.role === 'super_admin' || user?.role === 'manager') {
      const payments = db.getCollection<any>('gym_payments');
      const filteredP = payments
        .filter((p: any) => p.clientName.toLowerCase().includes(q) || (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)))
        .slice(0, 3)
        .map((p: any) => ({
          label: `Payment from ${p.clientName}`,
          sub: `Amount: $${p.amount} • Method: ${p.paymentMethod} • Status: ${p.status}`,
          path: `/payments`,
          icon: DollarSign
        }));
      if (filteredP.length > 0) results.push({ category: 'Payments Ledger', items: filteredP });
    }

    setSearchResults(results);
  }, [searchQuery, user]);

  // Click Outside search handler
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return `${profileRole} Dashboard`;
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment) return 'Portal Workspace';
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
            The Gym Fitness Club Hub
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div ref={searchRef} className="relative w-full max-w-xs md:max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search clients, coaches, payments, supplements..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-600 font-semibold"
          />
        </div>

        {/* Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-11 left-0 right-0 max-h-[70vh] overflow-y-auto bg-slate-950 border border-slate-900 shadow-2xl rounded-xl p-3 space-y-3.5 z-50">
            {searchResults.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2">{cat.category}</h5>
                <div className="space-y-0.5">
                  {cat.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.path}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
                      >
                        <div className="h-6 w-6 bg-slate-900 border border-slate-800/60 rounded flex items-center justify-center text-blue-500 shrink-0">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">{item.label}</p>
                          <span className="text-[9px] text-slate-500 font-semibold">{item.sub}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Area: Status, Alerts & User Profile */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            System Live
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
            <h4 className="text-xs font-bold text-slate-200">{profileName}</h4>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              {profileRole}
            </span>
          </div>
          
          <Avatar
            name={profileName}
            src=""
            size="sm"
          />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Log Out Portal"
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

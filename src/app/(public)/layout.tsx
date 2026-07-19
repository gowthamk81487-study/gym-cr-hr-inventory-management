'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, PhoneCall } from 'lucide-react';
import { cn } from '@/utils';
import Logo from '@/components/common/Logo';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Startup', href: '/about' },
    { label: 'Memberships', href: '/pricing' },
    { label: 'Personal Training', href: '/pt-pricing' },
    { label: 'Reviews', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600/35 selection:text-white">
      {/* Marketing Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="h-9 w-9" />
            <div>
              <span className="text-sm font-black text-white tracking-wide uppercase leading-none block">
                The Gym Fitness Club
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider transition-colors duration-200',
                    isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Portal Call To Action */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-lg shadow-blue-600/15 border border-blue-500/10 transition-all cursor-pointer active:scale-95"
            >
              Portal Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-900 bg-slate-950 px-6 py-4 space-y-3">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block text-sm font-bold uppercase tracking-wider py-2 border-b border-slate-900/40',
                  pathname === link.href ? 'text-blue-400' : 'text-slate-400'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-4 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md mt-4"
            >
              Portal Login
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {children}
      </main>

      {/* Marketing Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-5 w-5" />
              <span className="text-sm font-black text-white uppercase tracking-wider">
                The Gym Fitness Club
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              Next-generation Member Continuity, Coach Performance and Club Operations Management platforms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Site Sitemap</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-500">
              <Link href="/about" className="hover:text-blue-400 transition-colors">About Startup</Link>
              <Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing Packages</Link>
              <Link href="/pt-pricing" className="hover:text-blue-400 transition-colors">Personal Training</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Systems</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-500">
              <Link href="/login" className="hover:text-blue-400 transition-colors">Management Portal</Link>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full w-max">
                MVP Prototype v1.0
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Inquiries</h4>
            <div className="space-y-2 text-xs text-slate-500">
              <p>100 The Gym Fitness Club Blvd, Suite 400</p>
              <p>San Francisco, CA 94107</p>
              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <PhoneCall className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-bold">+1 (800) 555-PROV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Row */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-4">
          <p>
            © {new Date().getFullYear()} The Gym Fitness Club. All rights reserved. Designed for Gym Operations.
          </p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

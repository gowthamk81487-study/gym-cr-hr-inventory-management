'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import TopNav from '@/components/common/TopNav';


export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col desktop:pl-64 transition-all duration-300">
        {/* Top Header */}
        <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 p-6 md:p-8 space-y-8 animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/layouts/Section';
import Container from '@/layouts/Container';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-16 px-4 relative selection:bg-blue-600/35 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-rose-600/5 blur-[90px]" />
      
      <Container className="relative z-10 text-center space-y-6 max-w-md">
        <div className="h-14 w-14 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <ShieldAlert className="h-7 w-7 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-100 tracking-tight leading-none">404</h1>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Access Route Mismatch</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            The requested routing URL does not exist or has been disabled. Verify the URL query segment or return back.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link href="/">
            <Button variant="outline" size="md" className="text-xs flex items-center gap-2 border-slate-800 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Return to Website
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

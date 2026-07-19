'use client';

import React from 'react';
import { Target, Eye, Trophy, Sparkles } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Section from '@/layouts/Section';
import PageLayout from '@/layouts/PageLayout';
import { mockTrainers, mockFacilities } from '@/mock/data';

export default function AboutPage() {
  return (
    <PageLayout
      title="About The Gym Fitness Club"
      description="Unlocking human capability through calibrated physical operations and data science."
    >
      <div className="space-y-16 max-w-5xl mx-auto py-6">
        {/* 1. Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide border-b border-slate-900 pb-2">
              Our Physical Philosophy
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The Gym Fitness Club established the The Gym Fitness Club prototype to challenge status-quo gym operations. Traditional clubs separate training routines from metrics tracking; we merge them. 
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We provide clean elite facilities matched with structured, Promise-supported HR systems, ensuring coaches are paid transparently and clients stay connected with their dedicated trainers.
            </p>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-900 h-64">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600&h=400"
              alt="Gym Facilities"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 2. Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-900 bg-slate-900/10">
            <CardContent className="space-y-3">
              <div className="h-9 w-9 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <Target className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Our Core Mission</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                To build modern operational tools that enhance client-trainer relationships, track training records, and simplify billing processes for gym operators.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-900 bg-slate-900/10">
            <CardContent className="space-y-3">
              <div className="h-9 w-9 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <Eye className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Our Core Vision</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                To elevate fitness club management by providing design systems that transition from localized mock templates to fully integrated Stripe payment ledgers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. Facilities Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Our Operations</h4>
            <h3 className="text-lg font-black text-slate-100 uppercase">High-End Amenities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockFacilities.map((fac, idx) => (
              <Card key={idx} className="border-slate-900">
                <CardContent className="space-y-2">
                  <div className="h-8 w-8 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-center text-blue-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{fac.title}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">{fac.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 4. Meet Trainers */}
        <div className="space-y-8">
          <div className="text-center space-y-1">
            <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Elite Roster</h4>
            <h3 className="text-lg font-black text-slate-100 uppercase">Meet Our Certified Coaches</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTrainers.map((coach) => (
              <Card key={coach.id} className="border-slate-900 text-center">
                <CardContent className="space-y-4 flex flex-col items-center">
                  <img
                    src={coach.profilePic}
                    alt={coach.name}
                    className="h-16 w-16 rounded-full border border-slate-800 object-cover"
                  />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{coach.name}</h4>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                      {coach.specialization}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                    {coach.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Dumbbell, Shield, Trophy, Activity, MessageSquare, HelpCircle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import FeatureCard from '@/components/ui/FeatureCard';
import Section from '@/layouts/Section';
import Container from '@/layouts/Container';
import { mockFaqs, mockTrainers, mockTestimonials } from '@/mock/data';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { title: 'Elite Coaching Roster', description: 'Train with certified body recomposition powerlifters and metabolic conditioners.', icon: Trophy },
    { title: 'Premium Dark Aesthetics', description: 'Modern club amenities equipped with custom Olympic free weight zones.', icon: Dumbbell },
    { title: 'Continuous Progress Tracking', description: 'Integrated workout nutrition cards and progress metrics analysis.', icon: Activity },
    { title: 'Secured HR & Billing', description: 'Calibrated billing ledger integrations for seamless operations.', icon: Shield }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <Section spacing="xl" className="relative overflow-hidden border-b border-slate-900 bg-linear-to-b from-slate-950 via-slate-950 to-slate-900/40">
        {/* Dynamic mesh glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] rounded-full bg-blue-500/10 blur-[80px]" />
        
        <Container className="relative z-10 text-center space-y-6 max-w-4xl">
          <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full">
            Provolution Technologies Presents
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-none">
            Gym HR, Membership & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">Client Continuity</span>
          </h1>
          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The enterprise-grade operations prototype for modern health centers. Manage client coach matching, diet routines, automated payments, and HR payroll from a unified glassmorphic admin dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-4">
            <Link href="/pricing">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-black flex items-center justify-center gap-2 group shadow-lg">
                View Memberships <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-800 text-slate-300 hover:text-white">
                Book Consultation
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 2. Features Grid */}
      <Section spacing="lg" className="bg-slate-950/20 border-b border-slate-900">
        <Container className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Core Capabilities</h2>
            <h3 className="text-xl sm:text-3xl font-black text-slate-100">Why Modern Clubs Prefer Gym HR</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <FeatureCard
                key={idx}
                title={feat.title}
                description={feat.description}
                icon={feat.icon}
                badge={idx === 0 ? "Staffing" : undefined}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. Meet the Trainers Section */}
      <Section spacing="lg" className="border-b border-slate-900">
        <Container className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Expert Coaching</h2>
              <h3 className="text-xl sm:text-3xl font-black text-slate-100">Calibrated Fitness Trainers</h3>
            </div>
            <Link href="/pt-pricing" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
              View Personal Training <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTrainers.map((coach) => (
              <Card key={coach.id} isHoverable className="border-slate-900 group">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={coach.profilePic}
                      alt={coach.name}
                      className="h-14 w-14 rounded-xl border border-slate-800 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{coach.name}</h4>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{coach.specialization}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {coach.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Rated Testimonials Preview */}
      <Section spacing="lg" className="bg-slate-950/20 border-b border-slate-900">
        <Container className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Client Reviews</h2>
              <h3 className="text-xl sm:text-3xl font-black text-slate-100">Transformations That Speak</h3>
            </div>
            <Link href="/testimonials" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
              All Transformation Stories <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTestimonials.map((item) => (
              <Card key={item.id} className="border-slate-900 flex flex-col justify-between">
                <CardContent className="space-y-4">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{item.quote}"
                  </blockquote>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. Frequently Asked Questions FAQ */}
      <Section spacing="lg" className="border-b border-slate-900">
        <Container className="max-w-3xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex justify-center items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> Support FAQ
            </h2>
            <h3 className="text-xl sm:text-3xl font-black text-slate-100">Got Questions? We Have Answers</h3>
          </div>

          <div className="space-y-3.5">
            {mockFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-panel border-slate-900 rounded-lg overflow-hidden transition-colors">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-white cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-500">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Target, ShieldCheck, Zap, Award, Dumbbell } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { mockTrainers } from '@/mock/data';

export default function PtPricingPage() {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', coachSpecialty: 'strength' });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSelectedPack(null);
      setIsBooking(false);
      setFormData({ name: '', email: '', coachSpecialty: 'strength' });
      showToast('Mock Consultation Booked successfully! A coach will follow up.', 'success');
    }, 1500);
  };

  const packages = [
    { id: 'starter-10', title: 'Starter Pack (10 Hours)', price: 650, desc: 'Ideal for barbell form calibrations and general strength programming.', hourlyRate: 65 },
    { id: 'pro-24', title: 'Performance Pack (24 Hours)', price: 1440, desc: 'Our most popular metabolic body recomposition pack. Fully custom diet sheets.', hourlyRate: 60, popular: true },
    { id: 'elite-50', title: 'Championship Pack (50 Hours)', price: 2750, desc: 'Dedicated transformation journey. Comprehensive body scan analytics.', hourlyRate: 55 }
  ];

  return (
    <PageLayout
      title="Personal Training Bundles"
      description="Work 1-on-1 with certified coaches to build strength, drop fat, and master movement mechanics."
    >
      <div className="space-y-16 max-w-5xl mx-auto py-6">
        
        {/* 1. Coaching Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pack) => (
            <Card
              key={pack.id}
              className={`border-slate-900 flex flex-col justify-between relative ${
                pack.popular ? 'border-blue-500/20 shadow-lg ring-1 ring-blue-500/10' : ''
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-white bg-blue-600 px-2 py-0.5 rounded border border-blue-500">
                  Best Value Pack
                </span>
              )}
              
              <CardContent className="space-y-4 pt-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pack.title}</h4>
                  <h3 className="text-2xl font-black text-white">${pack.price}</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    ${pack.hourlyRate} / hour equivalent
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {pack.desc}
                </p>
              </CardContent>

              <div className="p-4 border-t border-slate-900 mt-4">
                <Button
                  variant={pack.popular ? 'primary' : 'outline'}
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedPack(pack.title);
                    setIsBooking(true);
                  }}
                  className="text-xs"
                >
                  Book Bundle
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* 2. Coaching Benefits Grid */}
        <div className="space-y-8">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-center">Coaching Advantages</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 w-8 mx-auto md:mx-0 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Accurate Metrics</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Weekly body composition checkins and caliper analysis.</p>
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 w-8 mx-auto md:mx-0 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Calibrated Diets</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Diet macros customized to fuel metabolic hypertrophy.</p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 w-8 mx-auto md:mx-0 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <Award className="h-4.5 w-4.5" />
              </div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Form Mastery</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Barbell form corrections to prevent joint overload risks.</p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="h-8 w-8 mx-auto md:mx-0 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Continuity Guard</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Coaches log all rosters, ensuring client training continuity.</p>
            </div>
          </div>
        </div>

        {/* 3. Meet the Coaches */}
        <div className="space-y-8">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-center">Available Master Trainers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTrainers.map((coach) => (
              <Card key={coach.id} className="border-slate-900">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={coach.profilePic} alt={coach.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{coach.name}</h4>
                      <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{coach.specialization}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {coach.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {selectedPack && (
        <Dialog
          isOpen={isBooking}
          onClose={() => {
            setSelectedPack(null);
            setIsBooking(false);
          }}
          title="Consultation Request"
        >
          <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-400 leading-normal">
              Register details below for a mock booking for <strong className="text-slate-200">{selectedPack}</strong>.
            </p>
            
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Marcus Sterling"
            />
            
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="marcus@example.com"
            />

            <Select
              label="Coaching Goal Specialty"
              options={[
                { value: 'strength', label: 'Barbell Strength & Powerlifting' },
                { value: 'hiit', label: 'HIIT & Cardiorespiratory Endurance' },
                { value: 'diet', label: 'Nutrition & Body Recomposition' }
              ]}
              value={formData.coachSpecialty}
              onChange={(e) => setFormData({ ...formData, coachSpecialty: e.target.value })}
            />

            <div className="flex gap-3 justify-end pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPack(null);
                  setIsBooking(false);
                }}
                disabled={isLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Request Consultation
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </PageLayout>
  );
}

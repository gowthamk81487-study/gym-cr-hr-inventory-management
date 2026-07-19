'use client';

import React, { useState } from 'react';
import { Check, Dumbbell, ShieldCheck } from 'lucide-react';
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/common/Toast';
import { mockMemberships } from '@/mock/data';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof mockMemberships[0] | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', branch: 'downtown' });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSelectedPlan(null);
      setIsRegistering(false);
      setFormData({ name: '', email: '', branch: 'downtown' });
      showToast('Mock Registration Successful! A confirmation note was logged.', 'success');
    }, 1500);
  };

  const planDurationLabels = {
    monthly: 'Month',
    quarterly: 'Quarter',
    yearly: 'Year'
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Pricing Matrix</span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">Calibrated Membership Tiers</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
          Choose a physical training tier suitable to your objectives. No hidden admin fees. Calibrate your progress.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockMemberships.map((plan) => (
          <Card
            key={plan.id}
            isHoverable
            className={`border-slate-900 flex flex-col justify-between relative ${
              plan.isPopular ? 'border-blue-500/20 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10' : ''
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg border border-blue-500">
                Highly Recommended
              </span>
            )}
            
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{plan.name}</h4>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    / {planDurationLabels[plan.billingPeriod || 'monthly']}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                {(plan.features || []).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                variant={plan.isPopular ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => {
                  setSelectedPlan(plan);
                  setIsRegistering(true);
                }}
                className="text-xs py-2"
              >
                Join {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="space-y-6 pt-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-center">Feature Matrix Details</h3>
        <div className="glass-panel border-slate-900 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40">
                <th className="p-3 font-bold text-slate-400 uppercase tracking-wider">Plan Benefits</th>
                <th className="p-3 font-bold text-slate-400 uppercase tracking-wider text-center">Basic</th>
                <th className="p-3 font-bold text-slate-400 uppercase tracking-wider text-center">Elite</th>
                <th className="p-3 font-bold text-slate-400 uppercase tracking-wider text-center">Premium VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-semibold text-slate-300">
              <tr className="hover:bg-slate-900/20">
                <td className="p-3 text-slate-400">Cardio Floor & Weights access</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
              </tr>
              <tr className="hover:bg-slate-900/20">
                <td className="p-3 text-slate-400">Locker Room access</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
              </tr>
              <tr className="hover:bg-slate-900/20">
                <td className="p-3 text-slate-400">Free Group Fitness classes</td>
                <td className="p-3 text-center text-slate-600">—</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
                <td className="p-3 text-center text-emerald-500">✓</td>
              </tr>
              <tr className="hover:bg-slate-900/20">
                <td className="p-3 text-slate-400">Personal Trainer Hours</td>
                <td className="p-3 text-center text-slate-600">—</td>
                <td className="p-3 text-center text-slate-600">Consultation only</td>
                <td className="p-3 text-center text-emerald-500">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Checkout Modal Dialog */}
      {selectedPlan && (
        <Dialog
          isOpen={isRegistering}
          onClose={() => {
            setSelectedPlan(null);
            setIsRegistering(false);
          }}
          title={`Register: ${selectedPlan.name}`}
        >
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-400 leading-normal">
              You selected the <strong className="text-slate-200">{selectedPlan.name}</strong> tier for{' '}
              <strong className="text-blue-400">${selectedPlan.price}</strong>. Fill out the fields to finalize mock checkout.
            </p>
            
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Sarah Jenkins"
            />
            
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah@example.com"
            />

            <Select
              label="Preferred Branch"
              options={[
                { value: 'downtown', label: 'The Gym Fitness Club Downtown Club' },
                { value: 'heights', label: 'The Gym Fitness Club Heights Club' },
                { value: 'marina', label: 'The Gym Fitness Club Marina Club' }
              ]}
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />

            <div className="flex gap-3 justify-end pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlan(null);
                  setIsRegistering(false);
                }}
                disabled={isLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="text-xs px-4!">
                Confirm & Enroll
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

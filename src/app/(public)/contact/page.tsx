'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card, { CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/common/Toast';
import { enquiryService } from '@/services';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', branch: 'downtown', msg: '' });
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.msg) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    
    setIsSending(true);
    try {
      await enquiryService.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        message: formData.msg
      });
      showToast('Inquiry submitted successfully! Our system managers have been notified.', 'success');
      setFormData({ name: '', email: '', phone: '', branch: 'downtown', msg: '' });
    } catch {
      showToast('Error sending inquiry.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Inquiries Portal</span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">Connect With Our Branches</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
          Have an inquiry regarding VIP personal training or corporate discount packages? Send a message directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Info Column */}
        <div className="space-y-6">
          <Card className="border-slate-900 bg-slate-900/10">
            <CardContent className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">The Gym Fitness Club Headquarters</h4>
              
              <div className="space-y-3.5 text-xs text-slate-400 font-medium">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>100 The Gym Fitness Club Blvd, Suite 400, San Francisco, CA 94107</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                  <span>+1 (800) 555-PROV</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                  <span>support@thegymfitnesshub.in</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Frame Decorator */}
          <div className="h-48 rounded-xl border border-slate-900 bg-slate-950 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <MapPin className="h-8 w-8 text-blue-500 animate-pulse-slow mb-2 relative z-10" />
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 relative z-10">San Francisco Branch Map</h5>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest relative z-10">Downtown / Heights / Marina</span>
          </div>
        </div>

        {/* Form Column */}
        <Card className="border-slate-900">
          <CardContent className="pt-2">
            <form onSubmit={handleSend} className="space-y-4">
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
              
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
              />

              <Select
                label="Target Branch"
                options={[
                  { value: 'downtown', label: 'The Gym Fitness Club Downtown Club' },
                  { value: 'heights', label: 'The Gym Fitness Club Heights Club' },
                  { value: 'marina', label: 'The Gym Fitness Club Marina Club' }
                ]}
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Inquiry Details</label>
                <textarea
                  required
                  rows={4}
                  value={formData.msg}
                  onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                  placeholder="Detail your inquiry regarding schedules, corporate discounts or billing checkins..."
                  className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
                />
              </div>

              <Button variant="primary" size="md" type="submit" isLoading={isSending} className="w-full flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> Send Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

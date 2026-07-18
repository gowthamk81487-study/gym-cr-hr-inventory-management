'use client';

import React, { useState } from 'react';
import { Star, MessageSquarePlus, Quote, TrendingUp } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/common/Toast';
import PageLayout from '@/layouts/PageLayout';
import { mockTestimonials } from '@/mock/data';

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState(mockTestimonials);
  const [formData, setFormData] = useState({ name: '', role: '', quote: '', rating: '5' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    
    const newReview = {
      id: `test-${reviews.length + 1}`,
      name: formData.name,
      role: formData.role || 'Member',
      quote: formData.quote,
      rating: parseInt(formData.rating, 10),
      duration: 'Ongoing'
    };

    setReviews([newReview, ...reviews]);
    setIsSubmitting(false);
    setFormData({ name: '', role: '', quote: '', rating: '5' });
    showToast('Feedback submitted successfully! It is now rendered locally.', 'success');
  };

  return (
    <PageLayout
      title="Client Transformations"
      description="Real results achieved by members working closely with our coaching roster."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSubmitting(true)}
          className="text-xs py-1.5 px-3! flex items-center gap-1.5"
        >
          <MessageSquarePlus className="h-4.5 w-4.5" /> Leave Review
        </Button>
      }
    >
      <div className="space-y-12 max-w-5xl mx-auto py-6">
        {/* Transformations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((item) => (
            <Card key={item.id} className="border-slate-900 flex flex-col justify-between group">
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  {item.duration && (
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                      {item.duration}
                    </span>
                  )}
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed relative">
                  <Quote className="absolute -top-3.5 -left-3 h-6 w-6 text-slate-900/60 -z-10" />
                  "{item.quote}"
                </blockquote>

                {/* Before/After Metrics */}
                {(item.beforeWeight || item.afterWeight) && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-900 text-center">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Before</span>
                      <span className="text-xs font-bold text-slate-300">{item.beforeWeight || 'N/A'}</span>
                    </div>
                    <div className="border-l border-slate-900 flex flex-col justify-center">
                      <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" /> After
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{item.afterWeight || 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                  <p className="text-[9px] text-slate-500 font-medium">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      <Dialog isOpen={isSubmitting} onClose={() => setIsSubmitting(false)} title="Submit Feedback">
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Marcus Sterling"
          />
          
          <Input
            label="Role/Status"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Standard Member / Coach"
          />

          <Select
            label="Star Rating"
            options={[
              { value: '5', label: '5 Stars - Flawless Operations' },
              { value: '4', label: '4 Stars - Highly Professional' },
              { value: '3', label: '3 Stars - Satisfactory' }
            ]}
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Experience</label>
            <textarea
              required
              rows={3}
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Detail your metabolic transformation, coaching experience, or facility review..."
              className="bg-slate-950/60 border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition-all font-semibold"
            />
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsSubmitting(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="text-xs px-4!">
              Submit Review
            </Button>
          </div>
        </form>
      </Dialog>
    </PageLayout>
  );
}

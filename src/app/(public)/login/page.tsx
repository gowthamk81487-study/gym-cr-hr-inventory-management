'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Lock, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/common/Toast';
import { authService } from '@/services';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      showToast('Login Successful! Access authorized.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Access Denied. Invalid credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-linear-to-b from-slate-950 to-slate-900/10 relative">
      {/* Visual background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-500/5 blur-[90px]" />
      
      <div className="w-full max-w-sm glass-panel border-slate-900 rounded-xl p-8 space-y-6 relative z-10 shadow-2xl">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/15">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-widest">Management Portal</h3>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
              The Gym Fitness Hub
            </span>
          </div>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            label="Email Address"
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@thegymfitnesshub.in"
            leftIcon={<Mail className="h-4 w-4 text-slate-600" />}
          />

          <Input
            label="Security Password"
            required
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••••••"
            leftIcon={<Lock className="h-4 w-4 text-slate-600" />}
          />

          {/* Remember Me / Forgot Password */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-semibold select-none">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0" 
              />
              <span>Remember Me</span>
            </label>
            <span className="hover:text-blue-400 cursor-pointer transition-colors" onClick={() => showToast('Password reset link simulated.', 'info')}>Forgot Password?</span>
          </div>

          <Button variant="primary" size="md" type="submit" isLoading={isLoading} className="w-full font-black mt-2">
            Authenticate Access
          </Button>
        </form>
      </div>
    </div>
  );
}

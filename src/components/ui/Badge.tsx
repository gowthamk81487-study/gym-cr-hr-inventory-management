import React from 'react';
import { cn } from '../../utils';

export interface BadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'emerald' | 'blue' | 'yellow' | 'rose' | 'slate';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'secondary', children, className }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase';
  
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
};
export default Badge;

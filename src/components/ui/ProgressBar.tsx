import React from 'react';
import { cn } from '@/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'sm',
  className,
  showLabel = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    primary: 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]',
    success: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    danger: 'bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
    warning: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
  };

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5'
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-400">
          <span>Progress</span>
          <span className="text-slate-200">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-900 border border-slate-800/40 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

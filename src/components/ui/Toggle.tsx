'use client';

import React from 'react';
import { cn } from '@/utils';

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  error,
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const switchSizes = {
    sm: 'w-8 h-4.5 after:h-3.5 after:w-3.5 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-3.5',
    md: 'w-11 h-6 after:h-5 after:w-5 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-5',
    lg: 'w-14 h-7.5 after:h-6.5 after:w-6.5 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-6.5'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="inline-flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              "bg-slate-800 border border-slate-700/60 rounded-full transition-all duration-200",
              "after:content-[''] after:absolute after:bg-white after:border-slate-300 after:border after:rounded-full after:transition-all",
              "peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-blue-500/25",
              "peer-checked:bg-blue-600 peer-checked:border-blue-500/40",
              disabled && 'opacity-40 cursor-not-allowed',
              switchSizes[size]
            )}
          />
        </div>
        {label && (
          <span className={cn('font-semibold text-slate-300', labelSizes[size], disabled && 'text-slate-500')}>
            {label}
          </span>
        )}
      </label>
      {error && <span className="text-[10px] text-rose-400 font-bold">{error}</span>}
    </div>
  );
};

export default Toggle;

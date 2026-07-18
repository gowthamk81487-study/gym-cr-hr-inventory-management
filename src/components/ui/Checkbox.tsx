'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const boxSizes = {
    sm: 'h-4 w-4 rounded',
    md: 'h-5 w-5 rounded-md',
    lg: 'h-6 w-6 rounded-md'
  };

  const checkSizes = {
    sm: 'h-3 w-3 stroke-[3]',
    md: 'h-3.5 w-3.5 stroke-[2.5]',
    lg: 'h-4 w-4 stroke-[2.5]'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
        <div className="relative flex items-center pt-0.5">
          <input
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              'flex items-center justify-center border border-slate-800 bg-slate-950/60 transition-all duration-200',
              'peer-focus:ring-2 peer-focus:ring-blue-500/25 peer-focus:border-blue-500/60',
              'peer-checked:bg-blue-600 peer-checked:border-blue-500',
              disabled && 'opacity-40 cursor-not-allowed',
              boxSizes[size]
            )}
          >
            <Check
              className={cn(
                'text-white scale-0 transition-transform duration-200 peer-checked:scale-100',
                'absolute hidden peer-checked:block',
                checkSizes[size]
              )}
            />
          </div>
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

export default Checkbox;

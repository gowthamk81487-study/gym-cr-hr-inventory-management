'use client';

import React from 'react';
import { cn } from '@/utils';

interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  error,
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const outerSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const innerSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative">
          <input
            type="radio"
            className="sr-only peer"
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              'rounded-full border border-slate-800 bg-slate-950/60 flex items-center justify-center transition-all duration-200',
              'peer-focus:ring-2 peer-focus:ring-blue-500/25 peer-focus:border-blue-500/60',
              'peer-checked:border-blue-500',
              disabled && 'opacity-40 cursor-not-allowed',
              outerSizes[size]
            )}
          >
            <div
              className={cn(
                'rounded-full bg-blue-500 scale-0 transition-transform duration-200 peer-checked:scale-100',
                'absolute hidden peer-checked:block',
                innerSizes[size]
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

export default RadioButton;

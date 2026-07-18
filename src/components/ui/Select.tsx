import React, { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, leftIcon, id, ...props }, ref) => {
    const uniqueId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={uniqueId} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-500 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={uniqueId}
            className={cn(
              'w-full px-3.5 py-2.5 bg-slate-900 border text-sm text-slate-200 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer appearance-none',
              leftIcon ? 'pl-10' : 'pl-3.5',
              'pr-10', // Leave space for a custom dropdown chevron if needed or default arrow
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-950'
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat'
            }}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-950 text-slate-200">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;

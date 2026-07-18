import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

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
          <input
            ref={ref}
            type={type}
            id={uniqueId}
            className={cn(
              'w-full px-3.5 py-2.5 bg-slate-900 border text-sm text-slate-100 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-950'
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-500 flex items-center justify-center pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15 border border-blue-500/10',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white',
    ghost: 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/15 border border-rose-500/10',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/15 border border-emerald-500/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isLoading && 'relative text-transparent!',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};
export default Button;

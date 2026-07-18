import React from 'react';
import { cn } from '@/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  description,
  children,
  className,
  required = false
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>

      {description && !error && (
        <p className="text-[10px] text-slate-500 font-medium leading-normal">
          {description}
        </p>
      )}

      {error && (
        <span className="text-[10px] text-rose-400 font-bold animate-fade-in-up">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;

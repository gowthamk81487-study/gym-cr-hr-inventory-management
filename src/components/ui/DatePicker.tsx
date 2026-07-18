'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/utils';
import Input from './Input';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn('w-full', className)}>
      <Input
        type="date"
        label={label}
        error={error}
        leftIcon={<Calendar className="h-4 w-4 text-slate-500" />}
        className="w-full text-slate-300 fill-current scheme-dark"
        {...props}
      />
    </div>
  );
};

export default DatePicker;

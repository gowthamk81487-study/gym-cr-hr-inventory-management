import React from 'react';
import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  center = false
}) => {
  const sizes = {
    sm: 'h-4 w-4 stroke-[3]',
    md: 'h-8 w-8 stroke-[2.5]',
    lg: 'h-12 w-12 stroke-[2]'
  };

  const spinner = (
    <svg
      className={cn('animate-spin text-blue-500', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-15"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (center) {
    return (
      <div className="w-full flex items-center justify-center p-8 min-h-[140px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

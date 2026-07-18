import React from 'react';
import { cn } from '@/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
  isGlass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  isHoverable = false,
  isGlass = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-900/60 p-6 overflow-hidden relative transition-all duration-300',
        isGlass ? 'glass-panel' : 'bg-slate-900/40',
        isHoverable && 'glass-panel-interactive hover:border-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex items-center justify-between border-b border-slate-900 pb-4 mb-4', className)} {...props}>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{title}</h3>
        {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('text-xs sm:text-sm text-slate-300 space-y-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-900', className)} {...props}>
      {children}
    </div>
  );
};

export default Card;

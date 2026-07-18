import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';

interface AlertCardProps {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  variant = 'info',
  className
}) => {
  const styles = {
    info: 'bg-blue-500/5 border-blue-500/10 text-blue-400',
    success: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/5 border-amber-500/10 text-amber-400',
    danger: 'bg-rose-500/5 border-rose-500/10 text-rose-400'
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertCircle
  };

  const Icon = icons[variant];

  return (
    <div className={cn('p-4 rounded-xl border flex gap-3.5', styles[variant], className)}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h5>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default AlertCard;

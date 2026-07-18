import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  className
}) => {
  return (
    <div className={cn('glass-panel p-6 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-slate-800 transition-all duration-300', className)}>
      {/* Background Accent Grid */}
      <div className="absolute -right-6 -bottom-6 text-slate-900/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-28 w-28" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl font-black text-slate-100 tracking-tight">
          {value}
        </h3>
        
        {(change !== undefined || description) && (
          <div className="flex items-center gap-1.5 text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  'flex items-center font-bold',
                  changeType === 'increase' && 'text-emerald-400',
                  changeType === 'decrease' && 'text-rose-400',
                  changeType === 'neutral' && 'text-slate-400'
                )}
              >
                {changeType === 'increase' && <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
                {changeType === 'decrease' && <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                {change}
              </span>
            )}
            {description && <span className="text-slate-500 font-medium">{description}</span>}
          </div>
        )}
      </div>

      {/* Glowing Icon Frame */}
      <div className="h-12 w-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-blue-400 shadow-inner group-hover:text-blue-300 group-hover:border-slate-700 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
};
export default StatCard;

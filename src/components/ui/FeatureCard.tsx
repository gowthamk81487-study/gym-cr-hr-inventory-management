import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import Card, { CardContent } from './Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  iconClassName?: string;
  className?: string;
  badge?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  iconClassName,
  className,
  badge
}) => {
  return (
    <Card isHoverable className={cn('group overflow-hidden border-slate-900', className)}>
      {/* Visual background ambient glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all duration-300" />
      
      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn('h-10 w-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-105 transition-transform duration-300', iconClassName)}>
            <Icon className="h-5 w-5" />
          </div>
          {badge && (
            <span className="text-[9px] font-bold tracking-widest text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 rounded-full uppercase">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
            {title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

import React from 'react';
import { Database, Plus } from 'lucide-react';
import { cn } from '@/utils';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is currently no data in this module. Click below to add a new record.',
  icon: Icon = Database,
  onActionClick,
  actionLabel = 'Create Record',
  className
}) => {
  return (
    <div
      className={cn(
        'glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 py-12 max-w-lg mx-auto border border-dashed border-slate-800',
        className
      )}
    >
      <div className="h-12 w-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
          {description}
        </p>
      </div>

      {onActionClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onActionClick}
          className="text-xs py-1.5 px-3! flex items-center gap-1.5 mt-2"
        >
          <Plus className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

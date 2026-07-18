import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Fetching Error',
  message = 'A simulated connection failure occurred. Please trigger a manual sync check.',
  onRetry,
  retryLabel = 'Retry Connection',
  className
}) => {
  return (
    <div
      className={cn(
        'glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 py-12 max-w-lg mx-auto border-rose-500/10',
        className
      )}
    >
      <div className="h-12 w-12 bg-rose-500/5 border border-rose-500/15 rounded-xl flex items-center justify-center text-rose-500 shadow-inner">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs py-1.5 px-3! flex items-center gap-1.5 mt-2 border-slate-700 text-slate-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

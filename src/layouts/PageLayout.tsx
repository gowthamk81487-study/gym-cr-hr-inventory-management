import React from 'react';
import { cn } from '@/utils';
import Container from './Container';

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  clean?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  actions,
  children,
  className,
  clean = false
}) => {
  return (
    <Container clean={clean} className={cn('space-y-6', className)}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="animate-fade-in-up">
        {children}
      </div>
    </Container>
  );
};

export default PageLayout;

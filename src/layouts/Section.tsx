import React from 'react';
import { cn } from '@/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  hasDivider?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  spacing = 'md',
  id,
  hasDivider = false
}) => {
  const spacingStyles = {
    none: 'py-0',
    sm: 'py-6 md:py-8',
    md: 'py-10 md:py-14',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32'
  };

  return (
    <section
      id={id}
      className={cn(
        spacingStyles[spacing],
        hasDivider && 'border-b border-slate-900/60',
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;

import React from 'react';
import { cn } from '../../utils';

export interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, circle = false }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-800/80 rounded-md',
        circle && 'rounded-full',
        className
      )}
    />
  );
};
export default Skeleton;

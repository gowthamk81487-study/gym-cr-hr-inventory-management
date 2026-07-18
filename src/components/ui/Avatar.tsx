'use client';

import React, { useState } from 'react';
import { cn } from '../../utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (userName: string) => {
    if (!userName) return '??';
    const parts = userName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg font-semibold',
    xl: 'h-20 w-20 text-2xl font-bold'
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden bg-slate-800 border border-slate-700 text-slate-200 shrink-0 font-medium select-none',
        sizes[size],
        className
      )}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
export default Avatar;

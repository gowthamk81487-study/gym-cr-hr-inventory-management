'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import Button from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full glass-panel rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5! rounded-lg">
            <X className="h-5 w-5 text-slate-400 hover:text-slate-200" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-slate-300 text-sm space-y-4">
          {children}
        </div>

        {/* Footer (if provided) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800/80 bg-slate-900/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dialog;

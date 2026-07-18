'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
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

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Panel container */}
          <motion.div
            className={cn(
              'relative w-full glass-panel rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-white/10',
              sizes[size]
            )}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-900 bg-slate-950/40">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{title}</h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1 rounded-lg">
                <X className="h-4.5 w-4.5 text-slate-400 hover:text-slate-200" />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto text-slate-300 text-sm space-y-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-900 bg-slate-950/20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

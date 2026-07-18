'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import Button from './Button';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-48 rounded-lg glass-panel bg-slate-950 shadow-2xl border border-slate-900 z-50 animate-fade-in-up py-1 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-900 text-left transition-colors cursor-pointer',
                  item.danger ? 'text-rose-400 hover:text-rose-300' : 'text-slate-300 hover:text-white'
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0 opacity-60" />}
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

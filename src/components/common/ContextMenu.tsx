'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  danger?: boolean;
}

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  items,
  className
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCoords({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  useEffect(() => {
    const handleClose = () => setVisible(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, []);

  return (
    <div onContextMenu={handleContextMenu} className={cn('relative w-full', className)}>
      {children}

      {visible && (
        <div
          ref={menuRef}
          className="fixed w-44 rounded-lg glass-panel bg-slate-950/95 border border-slate-900 shadow-2xl z-50 animate-fade-in-up py-1 focus:outline-none"
          style={{ top: `${coords.y}px`, left: `${coords.x}px` }}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setVisible(false);
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

export default ContextMenu;

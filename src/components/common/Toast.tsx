'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 shadow-emerald-500/5';
      case 'error':
        return 'border-rose-500/30 shadow-rose-500/5';
      case 'warning':
        return 'border-amber-500/30 shadow-amber-500/5';
      case 'info':
      default:
        return 'border-blue-500/30 shadow-blue-500/5';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'glass-panel border p-4 rounded-xl flex gap-3 shadow-xl pointer-events-auto animate-fade-in-up duration-200',
              getBorderColor(toast.type)
            )}
          >
            <div className="shrink-0 pt-0.5">{getIcon(toast.type)}</div>
            
            <div className="flex-1 space-y-1">
              {toast.title && (
                <h4 className="text-sm font-bold text-slate-100">{toast.title}</h4>
              )}
              <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 self-start p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
export default ToastProvider;

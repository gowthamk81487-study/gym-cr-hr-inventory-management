'use client';

import React, { useState } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'success'; // Or customized styling
      default:
        return 'primary';
    }
  };

  const Icon = variant === 'danger' ? ShieldAlert : AlertCircle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} className="text-xs">
            {cancelLabel}
          </Button>
          <Button
            variant={getVariantStyles()}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            className="text-xs py-1.5 px-4!"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border shadow-inner ${
          variant === 'danger'
            ? 'bg-rose-500/5 border-rose-500/10 text-rose-500'
            : 'bg-blue-500/5 border-blue-500/10 text-blue-500'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;

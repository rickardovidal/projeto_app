import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )} 
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className={cn(
        'premium-glass fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl border-l border-border/70 shadow-[0_28px_60px_rgba(2,8,23,0.6)] transform transition-transform duration-300 ease-in-out flex h-[100dvh] flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 p-4 h-16 shrink-0">
          <h3 className="text-lg font-semibold text-text-primary truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:bg-bg-tertiary/80 hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border/70 bg-bg-tertiary/25 p-4 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

import React from 'react';
import { useToastStore } from '../../stores/useToastStore';
import type { ToastType } from '../../stores/useToastStore';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-danger" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-accent-blue" />,
  };

  return (
    <div className="fixed top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-4 z-[100] flex flex-col gap-2 items-stretch sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'premium-glass flex items-center gap-3 w-full sm:w-auto sm:min-w-[320px] max-w-md rounded-xl p-4 shadow-[0_20px_40px_rgba(2,8,23,0.5)] animate-in slide-in-from-right-full duration-300'
          )}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="rounded-full p-1 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

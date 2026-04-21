import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border border-border/80 bg-gradient-to-b from-bg-tertiary to-[#151e31] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-accent-blue/60 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              error && 'border-danger focus:ring-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

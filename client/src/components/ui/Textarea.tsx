import React from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[90px] w-full rounded-xl border border-border/80 bg-gradient-to-b from-bg-tertiary to-[#151e31] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-accent-blue/60 focus:outline-none focus:ring-2 focus:ring-accent-blue/30 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

import React from 'react';
import { cn } from '../../lib/utils';

type BadgeType = 'status' | 'priority' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string; // PENDING, IN_PROGRESS, DONE, LOW, MEDIUM, HIGH
  type?: BadgeType;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, type = 'default', className, ...props }) => {
  const getStyles = () => {
    if (type === 'status') {
      switch (variant) {
        case 'PENDING': return 'border border-border/70 bg-bg-tertiary/70 text-text-secondary';
        case 'IN_PROGRESS': return 'border border-accent-blue/35 bg-accent-blue/15 text-accent-blue';
        case 'DONE': return 'border border-success/35 bg-success/15 text-success';
        default: return 'border border-border/70 bg-bg-tertiary/70 text-text-primary';
      }
    }
    if (type === 'priority') {
      switch (variant) {
        case 'LOW': return 'border border-border/70 bg-bg-tertiary/70 text-text-muted';
        case 'MEDIUM': return 'border border-warning/35 bg-warning/15 text-warning';
        case 'HIGH': return 'border border-danger/35 bg-danger/15 text-danger';
        default: return 'border border-border/70 bg-bg-tertiary/70 text-text-primary';
      }
    }
    return 'border border-border/70 bg-bg-tertiary/70 text-text-primary';
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
      getStyles(),
      className
    )} {...props}>
      {children}
    </span>
  );
};

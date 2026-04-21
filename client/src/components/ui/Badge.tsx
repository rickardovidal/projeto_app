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
        case 'PENDING': return 'bg-bg-tertiary text-text-secondary';
        case 'IN_PROGRESS': return 'bg-accent-blue/20 text-accent-blue';
        case 'DONE': return 'bg-success/20 text-success';
        default: return 'bg-bg-tertiary text-text-primary';
      }
    }
    if (type === 'priority') {
      switch (variant) {
        case 'LOW': return 'bg-bg-tertiary text-text-muted';
        case 'MEDIUM': return 'bg-warning/20 text-warning';
        case 'HIGH': return 'bg-danger/20 text-danger';
        default: return 'bg-bg-tertiary text-text-primary';
      }
    }
    return 'bg-bg-tertiary text-text-primary';
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
      getStyles(),
      className
    )} {...props}>
      {children}
    </span>
  );
};

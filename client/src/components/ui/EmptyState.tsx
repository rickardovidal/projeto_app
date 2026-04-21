import React from 'react';
import { cn } from '../../lib/utils';
import { Ghost } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn(
      'premium-card flex flex-col items-center justify-center rounded-2xl p-12 text-center',
      className
    )}>
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-bg-tertiary/85 border border-border/70">
        {icon || <Ghost className="h-10 w-10 text-text-muted" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-text-primary">{title}</h3>
      <p className="mb-8 max-w-[280px] text-sm text-text-secondary">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

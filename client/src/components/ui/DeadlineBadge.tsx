import React from 'react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { pt } from 'date-fns/locale';

interface DeadlineBadgeProps {
  date: Date | string;
  className?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ date, className }) => {
  const deadline = typeof date === 'string' ? new Date(date) : date;
  
  let label = '';
  let styles = '';

  if (isPast(deadline) && !isToday(deadline)) {
    label = 'Atrasado';
    styles = 'border border-danger/35 bg-danger/15 text-danger';
  } else if (isToday(deadline)) {
    label = 'Hoje';
    styles = 'border border-warning/35 bg-warning/15 text-warning';
  } else if (isTomorrow(deadline)) {
    label = 'Amanhã';
    styles = 'border border-orange-500/35 bg-orange-500/15 text-orange-500';
  } else {
    label = formatDistanceToNow(deadline, { addSuffix: true, locale: pt });
    styles = 'border border-accent-blue/35 bg-accent-blue/15 text-accent-blue';
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
      styles,
      className
    )}>
      {label}
    </span>
  );
};

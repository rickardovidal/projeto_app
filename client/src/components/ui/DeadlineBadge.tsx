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
    styles = 'bg-danger/20 text-danger';
  } else if (isToday(deadline)) {
    label = 'Hoje';
    styles = 'bg-warning/20 text-warning';
  } else if (isTomorrow(deadline)) {
    label = 'Amanhã';
    styles = 'bg-orange-500/20 text-orange-500';
  } else {
    label = formatDistanceToNow(deadline, { addSuffix: true, locale: pt });
    styles = 'bg-accent-blue/20 text-accent-blue';
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      styles,
      className
    )}>
      {label}
    </span>
  );
};

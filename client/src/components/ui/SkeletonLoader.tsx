import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'rectangle';
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  variant = 'rectangle', 
  className,
  width,
  height
}) => {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-xl',
    avatar: 'h-12 w-12 rounded-full',
    rectangle: 'rounded-md',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-bg-tertiary/90 via-bg-tertiary to-bg-tertiary/90',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

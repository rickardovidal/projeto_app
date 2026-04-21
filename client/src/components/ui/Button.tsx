import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'border border-accent-blue/30 bg-gradient-to-b from-accent-blue to-[#3d6fe0] text-white shadow-[0_10px_24px_rgba(92,141,255,0.35)] hover:brightness-110',
      secondary: 'border border-border/80 bg-gradient-to-b from-bg-tertiary to-[#151e31] text-text-primary hover:border-accent-blue/30 hover:text-white',
      ghost: 'border border-transparent bg-transparent text-text-secondary hover:bg-bg-tertiary/80 hover:text-text-primary',
      danger: 'border border-danger/40 bg-gradient-to-b from-danger to-[#ea5b5b] text-white shadow-[0_8px_18px_rgba(248,113,113,0.3)] hover:brightness-105',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold tracking-[0.01em] transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/80 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

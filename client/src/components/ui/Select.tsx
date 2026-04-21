import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('w-full space-y-1.5', className)} ref={containerRef}>
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-gradient-to-b from-bg-tertiary to-[#151e31] px-3 py-2 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-accent-blue/60 focus:outline-none focus:ring-2 focus:ring-accent-blue/30',
            error && 'border-danger focus:ring-danger'
          )}
        >
          <span className={cn(!selectedOption && 'text-text-muted')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border/70 bg-bg-secondary/95 p-1.5 shadow-[0_20px_40px_rgba(2,6,23,0.5)] backdrop-blur-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm text-text-primary outline-none hover:bg-bg-tertiary focus:bg-bg-tertiary',
                  value === option.value && 'bg-accent-blue/15 text-accent-blue'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};

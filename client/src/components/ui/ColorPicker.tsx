import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#64748B', '#78350F', '#1E293B'
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'h-8 w-8 rounded-full border-2 border-transparent transition-all hover:scale-110',
              value === color && 'border-white ring-2 ring-accent-blue'
            )}
            style={{ backgroundColor: color }}
          >
            {value === color && <Check className="mx-auto h-4 w-4 text-white" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div 
          className="h-8 w-8 rounded-md border border-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-8 w-24 rounded-md border border-border bg-bg-tertiary px-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
      </div>
    </div>
  );
};

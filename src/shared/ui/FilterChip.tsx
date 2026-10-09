import React from 'react';
import { X } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
  icon?: React.ReactNode;
  variant?: 'blue' | 'rose' | 'amber' | 'emerald' | 'slate';
  className?: string;
}

const variantStyles = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200/70 hover:bg-blue-100/70',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/70 hover:bg-rose-100/70',
  amber: 'bg-amber-50 text-amber-800 border-amber-200/70 hover:bg-amber-100/70',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100/70',
  slate: 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/70',
};

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  icon,
  variant = 'blue',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors select-none ${
        variantStyles[variant]
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="capitalize">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="hover:opacity-75 p-0.5 rounded-full hover:bg-black/5 transition-colors -mr-0.5"
        aria-label={`Eliminar filtro ${label}`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
};

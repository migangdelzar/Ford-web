import React from 'react';

export interface AtelierTimeframeOption<T extends string = string> {
  id: T;
  label: string;
}

interface AtelierTimeframeControlProps<T extends string = string> {
  options: AtelierTimeframeOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function AtelierTimeframeControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
}: AtelierTimeframeControlProps<T>) {
  return (
    <div
      className={`bg-[#F5F5F7] p-0.5 rounded-full flex items-center gap-0.5 border border-black/[0.03] ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer select-none ${
            value === opt.id
              ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
              : 'text-[#86868B] hover:text-[#1D1D1F]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

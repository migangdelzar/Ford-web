import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string;
  onChangeValue: (val: string) => void;
  onClear?: () => void;
  shortcut?: string;
  size?: 'sm' | 'md';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeValue,
  onClear,
  shortcut,
  placeholder = 'Buscar...',
  size = 'sm',
  className = '',
  id = 'search-input',
  ...props
}) => {
  const handleClear = () => {
    onChangeValue('');
    onClear?.();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search
        className={`absolute left-3 text-slate-400 pointer-events-none ${
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        }`}
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={shortcut ? `${placeholder} (${shortcut})` : placeholder}
        className={`w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/60 focus:border-slate-300 rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-slate-300 ${
          size === 'sm'
            ? 'pl-8.5 pr-8 py-1.5 text-xs'
            : 'pl-9 pr-8 py-2 text-xs'
        }`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/50 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

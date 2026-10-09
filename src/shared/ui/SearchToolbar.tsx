import React from 'react';
import { SearchInput } from './SearchInput';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  tabsSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Buscar...',
  tabsSlot,
  actionsSlot,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white rounded-2xl border border-black/[0.04] shadow-2xs ${className}`}
    >
      <div className="flex-1 min-w-0">
        <SearchInput
          value={searchQuery}
          onChangeValue={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder={placeholder}
          size="sm"
        />
      </div>

      {(tabsSlot || actionsSlot) && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {tabsSlot}
          {actionsSlot}
        </div>
      )}
    </div>
  );
};

export default SearchToolbar;

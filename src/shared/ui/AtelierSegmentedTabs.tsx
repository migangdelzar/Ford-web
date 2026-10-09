import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface AtelierTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  iconColor?: string;
}

interface AtelierSegmentedTabsProps<T extends string = string> {
  items: AtelierTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export function AtelierSegmentedTabs<T extends string = string>({
  items,
  activeId,
  onChange,
  className = '',
}: AtelierSegmentedTabsProps<T>) {
  return (
    <div
      className={`bg-[#F5F5F7] p-1 rounded-full border border-black/[0.04] flex items-center gap-0.5 w-full sm:w-auto overflow-x-auto shadow-2xs no-scrollbar ${className}`}
    >
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isActive
                ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            {Icon && (
              <Icon
                className={`size-3.5 ${
                  isActive ? tab.iconColor || 'text-[#0071E3]' : 'text-[#86868B]'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  isActive
                    ? 'bg-[#0071E3]/10 text-[#0071E3]'
                    : 'bg-black/5 text-[#86868B]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

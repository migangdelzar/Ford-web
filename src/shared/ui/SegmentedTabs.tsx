import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface SegmentedTabsProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  className = '',
}: SegmentedTabsProps<T>) {
  const paddingStyle = size === 'sm' ? 'p-0.5 rounded-full' : 'p-1 rounded-full';
  const buttonStyle =
    size === 'sm'
      ? 'px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs'
      : 'px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs';

  return (
    <div
      className={`bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-0.5 shadow-2xs overflow-x-auto no-scrollbar ${paddingStyle} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${buttonStyle} ${
              isActive
                ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            {Icon && (
              <Icon
                className={`size-3.5 ${
                  isActive ? 'text-[#0071E3]' : 'text-[#86868B]'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#0071E3]/10 text-[#0071E3]'
                    : 'bg-black/[0.06] text-[#86868B]'
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

export default SegmentedTabs;

import React from 'react';
import { motion } from 'motion/react';
import { SNAPPY_SPRING } from '../lib/motion';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface AnimatedPillTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  layoutIdPrefix?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AnimatedPillTabs<T extends string>({
  tabs,
  activeId,
  onChange,
  layoutIdPrefix = 'pill-tab',
  size = 'sm',
  className = '',
}: AnimatedPillTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/60 select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
            } ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {isActive && (
              <motion.div
                layoutId={`${layoutIdPrefix}-indicator`}
                transition={SNAPPY_SPRING}
                className="absolute inset-0 bg-white rounded-md shadow-2xs border border-slate-200/50"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] tabular-nums font-semibold px-1 rounded-full ${
                    isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

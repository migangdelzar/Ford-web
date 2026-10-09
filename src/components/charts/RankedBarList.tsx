import React from 'react';
import { DecorativeDots } from './chartTheme';

export interface RankedBarItem {
  label: string;
  value: number;
  percentage: number; // 0 - 100%
  gradientFrom: string;
  gradientTo: string;
  icon?: React.ReactNode;
}

export interface RankedBarListProps {
  title: string;
  subtitle?: string;
  items: RankedBarItem[];
}

export const RankedBarList: React.FC<RankedBarListProps> = ({
  title,
  subtitle,
  items,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <DecorativeDots />
      </div>

      {/* Horizontal Bar List */}
      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="font-bold text-slate-700">{item.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{item.value}</span>
            </div>

            {/* Gradient Track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                  backgroundImage: `linear-gradient(to right, ${item.gradientFrom}, ${item.gradientTo})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

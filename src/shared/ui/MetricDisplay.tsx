import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricDisplayProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  change,
  changeType = 'positive',
  subtext,
  size = 'md',
  className = '',
}) => {
  const valueSizes = {
    sm: 'text-lg sm:text-xl font-bold',
    md: 'text-2xl sm:text-3xl font-display font-bold tracking-tight',
    lg: 'text-3xl sm:text-4xl font-display font-extrabold tracking-tight',
  };

  const getChangeBadge = () => {
    if (!change) return null;

    let badgeBg = 'bg-[#34C759]/10 text-[#248A3D]';
    let Icon = TrendingUp;

    if (changeType === 'negative') {
      badgeBg = 'bg-[#FF3B30]/10 text-[#D70015]';
      Icon = TrendingDown;
    } else if (changeType === 'neutral') {
      badgeBg = 'bg-black/[0.04] text-[#86868B]';
      Icon = Minus;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${badgeBg}`}
      >
        <Icon className="size-3 stroke-[2.5]" />
        <span>{change}</span>
      </span>
    );
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <span className="text-xs font-semibold text-[#86868B] block truncate">
        {label}
      </span>

      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className={`text-[#1D1D1F] ${valueSizes[size]}`}>
          {value}
        </span>
        {getChangeBadge()}
      </div>

      {subtext && (
        <span className="text-[11px] font-medium text-[#86868B] block leading-snug">
          {subtext}
        </span>
      )}
    </div>
  );
};

export default MetricDisplay;

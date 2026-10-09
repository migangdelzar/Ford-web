import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconBadge, IconBadgeColor } from './IconBadge';
import { MetricDisplay } from './MetricDisplay';
import { AtelierCard } from './AtelierCard';

export interface KpiMetricWidgetProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: IconBadgeColor;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  chartSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const KpiMetricWidget: React.FC<KpiMetricWidgetProps> = ({
  label,
  value,
  icon,
  iconColor = 'blue',
  change,
  changeType = 'positive',
  subtext,
  chartSlot,
  actionSlot,
  active = false,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`select-none ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''}`}
    >
      <AtelierCard
        padding="md"
        className={`relative overflow-hidden transition-all ${
          active ? 'ring-2 ring-[#0071E3] bg-[#0071E3]/[0.02]' : ''
        } ${className}`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          {icon && <IconBadge icon={icon} color={iconColor} size="sm" />}
          {actionSlot && <div className="shrink-0">{actionSlot}</div>}
        </div>

        <MetricDisplay
          label={label}
          value={value}
          change={change}
          changeType={changeType}
          subtext={subtext}
          size="md"
        />

        {chartSlot && <div className="mt-3 pt-2 border-t border-black/[0.04]">{chartSlot}</div>}
      </AtelierCard>
    </div>
  );
};

export default KpiMetricWidget;

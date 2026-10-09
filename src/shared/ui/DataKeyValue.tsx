import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconBadge, IconBadgeColor } from './IconBadge';

export interface DataKeyValueProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: IconBadgeColor;
  layout?: 'horizontal' | 'vertical' | 'pill';
  className?: string;
}

export const DataKeyValue: React.FC<DataKeyValueProps> = ({
  label,
  value,
  icon,
  iconColor = 'blue',
  layout = 'horizontal',
  className = '',
}) => {
  if (layout === 'pill') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F5F5F7] border border-black/[0.04] text-xs ${className}`}
      >
        {icon && <IconBadge icon={icon} color={iconColor} size="xs" />}
        <span className="font-medium text-[#86868B]">{label}:</span>
        <span className="font-semibold text-[#1D1D1F]">{value}</span>
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B]">
          {icon && <IconBadge icon={icon} color={iconColor} size="xs" />}
          <span>{label}</span>
        </div>
        <div className="text-xs sm:text-sm font-semibold text-[#1D1D1F] break-words">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 text-xs py-1.5 border-b border-black/[0.03] last:border-b-0 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[#86868B] font-medium shrink-0">
        {icon && <IconBadge icon={icon} color={iconColor} size="xs" />}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-[#1D1D1F] text-right truncate">
        {value}
      </div>
    </div>
  );
};

export default DataKeyValue;

import React from 'react';
import { Badge } from './Badge';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'purple';
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'tertiary',
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-[#1D1D1F] truncate">
            {title}
          </h3>
          {badge !== undefined && (
            <Badge variant={badgeVariant} size="xs">
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#86868B] mt-0.5 truncate leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-1.5">{action}</div>}
    </div>
  );
};

export default SectionHeader;

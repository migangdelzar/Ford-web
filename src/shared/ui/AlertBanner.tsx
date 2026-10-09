import React from 'react';
import { LucideIcon, Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { IconBadge, IconBadgeColor } from './IconBadge';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface AlertBannerProps {
  type?: AlertType;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const typeConfigs: Record<
  AlertType,
  { defaultIcon: LucideIcon; color: IconBadgeColor; bg: string; border: string; text: string }
> = {
  info: {
    defaultIcon: Info,
    color: 'blue',
    bg: 'bg-[#0071E3]/[0.06]',
    border: 'border-[#0071E3]/20',
    text: 'text-[#0071E3]',
  },
  success: {
    defaultIcon: CheckCircle2,
    color: 'green',
    bg: 'bg-[#34C759]/[0.06]',
    border: 'border-[#34C759]/20',
    text: 'text-[#248A3D]',
  },
  warning: {
    defaultIcon: AlertTriangle,
    color: 'orange',
    bg: 'bg-[#FF9500]/[0.08]',
    border: 'border-[#FF9500]/25',
    text: 'text-[#C17E1F]',
  },
  danger: {
    defaultIcon: AlertCircle,
    color: 'rose',
    bg: 'bg-[#FF3B30]/[0.06]',
    border: 'border-[#FF3B30]/20',
    text: 'text-[#D70015]',
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  description,
  icon,
  onClose,
  action,
  className = '',
}) => {
  const { defaultIcon, color, bg, border, text } = typeConfigs[type];
  const IconComponent = icon || defaultIcon;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 shadow-2xs ${bg} ${border} ${className}`}
    >
      <IconBadge icon={IconComponent} color={color} size="sm" />

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={`text-xs sm:text-sm font-bold leading-snug ${text}`}>
          {title}
        </h4>
        {description && (
          <div className="text-xs text-[#1D1D1F]/80 mt-1 leading-relaxed">
            {description}
          </div>
        )}
        {action && <div className="mt-2.5">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors"
        >
          <X className="size-4 stroke-[2.2]" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;

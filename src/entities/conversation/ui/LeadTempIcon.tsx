import React from 'react';
import { useTranslation } from 'react-i18next';
import { LeadTemperature } from '../../../types';
import { TEMPERATURE_META } from '../model/conversation.constants';

export interface LeadTempIconProps {
  temperature: LeadTemperature;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LeadTempIcon: React.FC<LeadTempIconProps> = ({
  temperature,
  showLabel = false,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation();
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  const meta = TEMPERATURE_META[temperature] || TEMPERATURE_META.cold;
  const IconComponent = meta.icon;

  const label =
    temperature === 'hot'
      ? t('temperature.hot')
      : temperature === 'warm'
      ? t('temperature.warm')
      : t('temperature.cold');

  if (showLabel) {
    return (
      <span
        title={`Lead ${label}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100/70 border border-slate-200/70 text-slate-700 ${className}`}
      >
        <IconComponent className={`${iconSize} ${meta.textColor} shrink-0`} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span
      title={`Lead ${label}`}
      className={`inline-flex items-center gap-1 shrink-0 text-[10px] font-medium text-slate-500 ${className}`}
    >
      <IconComponent className={`${iconSize} ${meta.textColor}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
};

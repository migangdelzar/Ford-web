import React from 'react';
import { LeadTemperature } from '../../../types';

interface LeadTempBadgeProps {
  temperature: LeadTemperature;
  showLabel?: boolean;
  className?: string;
}

export const LeadTempBadge: React.FC<LeadTempBadgeProps> = ({
  temperature,
  showLabel = false,
  className = '',
}) => {
  const config = {
    hot: {
      dotColor: 'bg-rose-500 ring-rose-200/80',
      label: 'Caliente',
      pillClass: 'text-rose-700 bg-rose-50 border-rose-200/60',
    },
    warm: {
      dotColor: 'bg-amber-500 ring-amber-200/80',
      label: 'Tibio',
      pillClass: 'text-amber-800 bg-amber-50 border-amber-200/60',
    },
    cold: {
      dotColor: 'bg-slate-400 ring-slate-200/80',
      label: 'Frío',
      pillClass: 'text-slate-600 bg-slate-100 border-slate-200/60',
    },
  }[temperature];

  if (showLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.pillClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ring-2 shrink-0`} />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span
      title={`Lead ${config.label}`}
      className={`inline-block w-2 h-2 rounded-full ${config.dotColor} ring-2 shrink-0 ${className}`}
    />
  );
};

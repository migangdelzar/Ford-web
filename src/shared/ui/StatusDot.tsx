import React from 'react';

export type StatusDotVariant =
  | 'online'
  | 'offline'
  | 'busy'
  | 'away'
  | 'ai'
  | 'live'
  | 'warning'
  | 'danger';

export type StatusDotSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusDotProps {
  status?: StatusDotVariant;
  size?: StatusDotSize;
  ping?: boolean;
  withRing?: boolean;
  className?: string;
  title?: string;
}

const colorMap: Record<StatusDotVariant, { bg: string; ring: string }> = {
  online: { bg: 'bg-[#10B981]', ring: 'bg-[#10B981]/40' },
  live: { bg: 'bg-[#10B981]', ring: 'bg-[#10B981]/40' },
  busy: { bg: 'bg-[#EF4444]', ring: 'bg-[#EF4444]/40' },
  danger: { bg: 'bg-[#EF4444]', ring: 'bg-[#EF4444]/40' },
  away: { bg: 'bg-[#F59E0B]', ring: 'bg-[#F59E0B]/40' },
  warning: { bg: 'bg-[#F59E0B]', ring: 'bg-[#F59E0B]/40' },
  ai: { bg: 'bg-[#0071E3]', ring: 'bg-[#0071E3]/40' },
  offline: { bg: 'bg-slate-400', ring: 'bg-slate-400/40' },
};

const sizeMap: Record<StatusDotSize, string> = {
  xs: 'size-2',
  sm: 'size-2.5',
  md: 'size-3',
  lg: 'size-3.5',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'online',
  size = 'sm',
  ping = false,
  withRing = true,
  className = '',
  title,
}) => {
  const { bg, ring } = colorMap[status];
  const sizeClass = sizeMap[size];

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
      title={title || status}
    >
      {ping && (
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ring} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ${sizeClass} ${bg} ${
          withRing ? 'ring-2 ring-white shadow-2xs' : ''
        }`}
      />
    </span>
  );
};

export default StatusDot;

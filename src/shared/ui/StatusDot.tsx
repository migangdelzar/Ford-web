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

interface StatusDotProps {
  status?: StatusDotVariant;
  size?: StatusDotSize;
  ping?: boolean;
  className?: string;
  title?: string;
}

const colorMap: Record<StatusDotVariant, { bg: string; ring: string }> = {
  online: { bg: 'bg-[#34C759]', ring: 'bg-[#34C759]/40' },
  live: { bg: 'bg-[#34C759]', ring: 'bg-[#34C759]/40' },
  busy: { bg: 'bg-[#FF3B30]', ring: 'bg-[#FF3B30]/40' },
  danger: { bg: 'bg-[#FF3B30]', ring: 'bg-[#FF3B30]/40' },
  away: { bg: 'bg-[#FF9500]', ring: 'bg-[#FF9500]/40' },
  warning: { bg: 'bg-[#FF9500]', ring: 'bg-[#FF9500]/40' },
  ai: { bg: 'bg-[#0071E3]', ring: 'bg-[#0071E3]/40' },
  offline: { bg: 'bg-[#86868B]', ring: 'bg-[#86868B]/40' },
};

const sizeMap: Record<StatusDotSize, string> = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'online',
  size = 'sm',
  ping = false,
  className = '',
  title,
}) => {
  const { bg, ring } = colorMap[status];
  const sizeClass = sizeMap[size];

  return (
    <span
      className={`relative inline-flex shrink-0 ${sizeClass} ${className}`}
      title={title || status}
    >
      {ping && (
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ring} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ${sizeClass} ${bg} ring-2 ring-white`}
      />
    </span>
  );
};

export default StatusDot;

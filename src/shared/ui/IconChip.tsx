import React from 'react';

export type IconChipAccent = 'pink' | 'orange' | 'teal' | 'blue' | 'purple';

export interface IconChipProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  accent?: IconChipAccent;
  size?: 'sm' | 'md' | 'lg';
}

const accentMap: Record<IconChipAccent, { bg: string; text: string }> = {
  pink: {
    bg: 'bg-[var(--accent-pink-soft)]',
    text: 'text-[#F4638C]',
  },
  orange: {
    bg: 'bg-[var(--accent-orange-soft)]',
    text: 'text-[#F5A623]',
  },
  teal: {
    bg: 'bg-[var(--accent-teal-soft)]',
    text: 'text-[#2DD4BF]',
  },
  blue: {
    bg: 'bg-[var(--accent-blue-soft)]',
    text: 'text-[#4A90D9]',
  },
  purple: {
    bg: 'bg-[var(--accent-purple-soft)]',
    text: 'text-[#9B6EF3]',
  },
};

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const IconChip: React.FC<IconChipProps> = ({
  icon,
  accent = 'pink',
  size = 'md',
  className = '',
  ...props
}) => {
  const { bg, text } = accentMap[accent];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${bg} ${text} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {icon}
    </div>
  );
};

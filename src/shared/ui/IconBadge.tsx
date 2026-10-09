import React from 'react';
import { LucideIcon } from 'lucide-react';

export type IconBadgeColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'rose'
  | 'purple'
  | 'slate'
  | 'amber'
  | 'indigo';

export type IconBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface IconBadgeProps {
  icon: LucideIcon;
  color?: IconBadgeColor;
  size?: IconBadgeSize;
  className?: string;
}

const colorStyles: Record<IconBadgeColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#0071E3]/10', text: 'text-[#0071E3]' },
  green: { bg: 'bg-[#34C759]/10', text: 'text-[#34C759]' },
  orange: { bg: 'bg-[#FF9500]/10', text: 'text-[#FF9500]' },
  rose: { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]' },
  purple: { bg: 'bg-[#AF52DE]/10', text: 'text-[#AF52DE]' },
  slate: { bg: 'bg-[#86868B]/10', text: 'text-[#1D1D1F]' },
  amber: { bg: 'bg-[#FFCC00]/15', text: 'text-[#D9A000]' },
  indigo: { bg: 'bg-[#5856D6]/10', text: 'text-[#5856D6]' },
};

const sizeStyles: Record<IconBadgeSize, { container: string; icon: string }> = {
  xs: { container: 'size-6 rounded-lg', icon: 'size-3 stroke-[2.25]' },
  sm: { container: 'size-7 sm:size-8 rounded-xl', icon: 'size-4 sm:size-4.5 stroke-[2.25]' },
  md: { container: 'size-9 sm:size-10 rounded-2xl', icon: 'size-5 stroke-[2.25]' },
  lg: { container: 'size-11 sm:size-12 rounded-2xl', icon: 'size-6 stroke-[2]' },
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  color = 'blue',
  size = 'sm',
  className = '',
}) => {
  const { bg, text } = colorStyles[color];
  const { container, icon: iconSize } = sizeStyles[size];

  return (
    <div
      className={`${container} ${bg} ${text} flex items-center justify-center shrink-0 ${className}`}
    >
      <Icon className={iconSize} />
    </div>
  );
};

export default IconBadge;

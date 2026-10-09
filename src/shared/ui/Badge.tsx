import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'purple'
  | 'ai';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100/90 text-[#1C1E26] border-[#EEF0F3]',
  primary: 'bg-[#E8F1FF] text-[#007AFF] border-[#007AFF]/20 font-semibold',
  secondary: 'bg-[#1C1E26] text-white border-slate-800 shadow-2xs',
  tertiary: 'bg-[#F8F9FB] text-[#6B7280] border-[#EEF0F3]',
  neutral: 'bg-slate-100/90 text-[#6B7280] border-slate-200',
  success: 'bg-[#EDF6F0] text-[#3D9A5C] border-[#3D9A5C]/20 font-semibold',
  warning: 'bg-[#FCF6E5] text-[#C17E1F] border-[#C17E1F]/20 font-semibold',
  danger: 'bg-[#FDF3F2] text-[#C4453A] border-[#C4453A]/20 font-semibold',
  error: 'bg-[#FDF3F2] text-[#C4453A] border-[#C4453A]/20 font-semibold',
  info: 'bg-[#F0F7F9] text-[#4A8FA8] border-[#4A8FA8]/20 font-semibold',
  purple: 'bg-[#E8F1FF] text-[#007AFF] border-[#007AFF]/20 font-semibold',
  ai: 'bg-[#F0F7F9] text-[#4A8FA8] border-[#4A8FA8]/20 font-semibold',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  primary: 'bg-[#007AFF]',
  secondary: 'bg-[#3D9A5C]',
  tertiary: 'bg-slate-400',
  neutral: 'bg-slate-400',
  success: 'bg-[#3D9A5C]',
  warning: 'bg-[#C17E1F]',
  danger: 'bg-[#C4453A]',
  error: 'bg-[#C4453A]',
  info: 'bg-[#4A8FA8]',
  purple: 'bg-[#007AFF]',
  ai: 'bg-[#4A8FA8]',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.2 text-[10px] font-semibold gap-1 rounded-md tracking-tight',
  sm: 'px-2 py-0.5 text-xs font-semibold gap-1.5 rounded-lg tracking-tight',
  md: 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-xl tracking-tight',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'xs',
  dot = false,
  dotColor,
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex flex-row items-center whitespace-nowrap border select-none transition-colors ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColor || dotStyles[variant]
          }`}
        />
      )}
      {icon && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      <span className="inline-flex flex-row items-center gap-1 truncate">{children}</span>
    </span>
  );
};

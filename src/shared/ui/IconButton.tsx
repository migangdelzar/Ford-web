import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'glass'
  | 'danger'
  | 'subtle';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  badge?: boolean;
  isLoading?: boolean;
  active?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    'bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062CC] text-white shadow-2xs border border-[#0071E3]/20',
  secondary:
    'bg-[#1D1D1F] hover:bg-[#2D2D2F] active:bg-[#000000] text-white shadow-2xs border border-white/10',
  tertiary:
    'bg-[#F5F5F7] hover:bg-[#E8E8ED] active:bg-[#E2E2E7] text-[#1D1D1F] border border-black/[0.04]',
  ghost:
    'bg-transparent hover:bg-black/[0.05] active:bg-black/[0.08] text-[#86868B] hover:text-[#1D1D1F]',
  glass:
    'bg-white/70 backdrop-blur-md hover:bg-white/90 active:bg-white text-[#1D1D1F] border border-black/[0.06] shadow-2xs',
  subtle:
    'bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] border border-[#0071E3]/15',
  danger:
    'bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/15',
};

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  xs: { button: 'size-6 rounded-lg', icon: 'size-3.5 stroke-[2.2]' },
  sm: { button: 'size-7 sm:size-8 rounded-xl', icon: 'size-4 stroke-[2.2]' },
  md: { button: 'size-9 sm:size-10 rounded-2xl', icon: 'size-4.5 stroke-[2]' },
  lg: { button: 'size-11 sm:size-12 rounded-2xl', icon: 'size-5.5 stroke-[2]' },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'tertiary',
  size = 'sm',
  label,
  tooltip,
  tooltipPosition = 'top',
  badge = false,
  isLoading = false,
  active = false,
  disabled,
  className = '',
  ...props
}) => {
  const { button: buttonSize, icon: iconSize } = sizeStyles[size];

  const buttonContent = (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.92 }}
      disabled={disabled || isLoading}
      aria-label={label || tooltip}
      className={`relative inline-flex items-center justify-center select-none transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40 disabled:opacity-40 disabled:pointer-events-none ${buttonSize} ${
        active ? 'bg-[#0071E3] text-white shadow-xs' : variantStyles[variant]
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin shrink-0`} />
      ) : (
        <Icon className={`${iconSize} shrink-0`} />
      )}

      {badge && (
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#FF3B30] ring-2 ring-white" />
      )}
    </motion.button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default IconButton;

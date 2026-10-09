import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'subtle'
  | 'purple'
  | 'dark';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary (Brand Accent #007AFF)
  primary:
    'bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#0052B3] text-white font-semibold shadow-xs hover:shadow-sm border border-[#0062CC]/30 focus-visible:ring-[#007AFF]/40',
  
  // Secondary (Deep Noir / Executive Dark)
  secondary:
    'bg-[#1C1E26] hover:bg-black active:bg-slate-950 text-white font-semibold shadow-xs border border-slate-800 focus-visible:ring-slate-800/40',
  
  // Dark alias for secondary
  dark:
    'bg-[#1C1E26] hover:bg-black active:bg-slate-950 text-white font-semibold shadow-xs border border-slate-800 focus-visible:ring-slate-800/40',

  // Purple AI Accent
  purple:
    'bg-[#AF52DE] hover:bg-[#9B42C8] active:bg-[#8632B2] text-white font-semibold shadow-xs border border-[#AF52DE]/30 focus-visible:ring-[#AF52DE]/40',

  // Tertiary (Muted Neutral Gray)
  tertiary:
    'bg-[#F8F9FB] hover:bg-[#EEF0F3] active:bg-[#E5E8EC] text-[#1C1E26] font-medium border border-[#EEF0F3] focus-visible:ring-slate-400/40',

  // Clean Outline
  outline:
    'bg-white hover:bg-[#F8F9FB] active:bg-[#EEF0F3] text-[#6B7280] hover:text-[#1C1E26] font-medium border border-[#EEF0F3] hover:border-slate-300 shadow-2xs focus-visible:ring-slate-400/40',

  // Ghost
  ghost:
    'bg-transparent hover:bg-[#F8F9FB] active:bg-[#EEF0F3] text-[#6B7280] hover:text-[#1C1E26] font-medium focus-visible:ring-slate-400/40',

  // Semantic Action: Success (Emerald)
  success:
    'bg-[#3D9A5C] hover:bg-[#2E7345] active:bg-[#235835] text-white font-semibold shadow-xs border border-[#3D9A5C]/20 focus-visible:ring-[#3D9A5C]/40',

  // Semantic Action: Warning (Amber)
  warning:
    'bg-[#FCF6E5] hover:bg-[#FCF0CD] text-[#C17E1F] font-medium border border-[#C17E1F]/20 focus-visible:ring-[#C17E1F]/40',

  // Semantic Action: Danger / Destructive
  danger:
    'bg-[#FDF3F2] hover:bg-[#FCDEDC] active:bg-[#FBC4C1] text-[#C4453A] hover:text-[#B23C32] font-medium border border-[#C4453A]/20 focus-visible:ring-[#C4453A]/40',

  // Subtle Tinted
  subtle:
    'bg-[#E8F1FF] hover:bg-[#D4E6FF] active:bg-[#BED8FF] text-[#007AFF] font-medium border border-[#007AFF]/20 focus-visible:ring-[#007AFF]/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[11px] rounded-lg gap-1 tracking-tight',
  sm: 'px-2.5 py-1.5 text-xs rounded-xl gap-1.5 tracking-tight',
  md: 'px-3.5 py-2 text-xs font-semibold rounded-xl gap-2 tracking-tight',
  lg: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2.5 tracking-tight',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'tertiary',
  size = 'sm',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:pointer-events-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;

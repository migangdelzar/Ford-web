import React from 'react';
import { motion } from 'motion/react';

interface ListItemProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ListItem: React.FC<ListItemProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  active = false,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const isInteractive = Boolean(onClick) && !disabled;

  const sizePadding = {
    sm: 'p-2 sm:p-2.5 rounded-xl gap-2.5',
    md: 'p-3 sm:p-3.5 rounded-2xl gap-3',
    lg: 'p-4 sm:p-4.5 rounded-2xl gap-3.5',
  };

  return (
    <motion.div
      whileTap={isInteractive ? { scale: 0.99 } : undefined}
      onClick={isInteractive ? onClick : undefined}
      className={`flex items-center justify-between transition-all select-none ${
        sizePadding[size]
      } ${
        active
          ? 'bg-[#0071E3]/[0.07] border border-[#0071E3]/20 shadow-2xs'
          : isInteractive
          ? 'bg-white hover:bg-[#F5F5F7] active:bg-[#E8E8ED] border border-black/[0.04] cursor-pointer'
          : 'bg-white border border-black/[0.04]'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {leading && <div className="shrink-0">{leading}</div>}

        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] font-normal text-[#86868B] truncate mt-0.5 leading-tight">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {trailing && <div className="shrink-0 ml-2">{trailing}</div>}
    </motion.div>
  );
};

export default ListItem;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { IconBadge, IconBadgeColor } from './IconBadge';

export interface AccordionItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: IconBadgeColor;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  icon,
  iconColor = 'blue',
  children,
  isExpanded: controlledExpanded,
  onToggle,
  badge,
  className = '',
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggle = onToggle || (() => setInternalExpanded((prev) => !prev));

  return (
    <div
      className={`border border-black/[0.04] bg-white rounded-2xl overflow-hidden transition-all shadow-2xs ${className}`}
    >
      <div
        onClick={toggle}
        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-[#F5F5F7]/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && <IconBadge icon={icon} color={iconColor} size="sm" />}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate">
                {title}
              </div>
              {badge}
            </div>
            {subtitle && (
              <div className="text-[11px] text-[#86868B] truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 text-[#86868B] p-1 rounded-lg hover:bg-black/[0.04]">
          {isExpanded ? (
            <ChevronDown className="size-4 stroke-[2.2]" />
          ) : (
            <ChevronRight className="size-4 stroke-[2.2]" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-black/[0.03]"
          >
            <div className="p-3.5 bg-[#F9F9FB]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionItem;

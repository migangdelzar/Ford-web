import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { SNAPPY_SPRING } from '../../../shared/lib/motion';

interface SidebarNavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: number;
  onClick: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  badge,
  onClick,
}) => {
  return (
    <button
      id={`nav-item-${id}`}
      type="button"
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`relative w-full flex items-center ${
        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
      } rounded-xl transition-all duration-150 ease-out active:scale-[0.98] text-left group cursor-pointer ${
        isActive
          ? 'text-slate-900 font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
      }`}
    >
      {/* Single Fluid Active Container with Left Accent Bar inside */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-tab-highlight"
          transition={SNAPPY_SPRING}
          className="absolute inset-0 bg-slate-100/90 rounded-xl border border-slate-200/70 shadow-2xs overflow-hidden"
        >
          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#0071E3]" />
        </motion.div>
      )}

      {/* Nav Content */}
      <span className="relative z-10 flex items-center gap-3 min-w-0">
        <Icon
          className={`size-4 shrink-0 transition-transform duration-200 ease-out ${
            isActive
              ? 'text-[#0071E3] stroke-[2.25] scale-105'
              : 'text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 stroke-[1.75]'
          }`}
        />

        {!isCollapsed && (
          <span
            className={`truncate text-xs tracking-tight transition-all duration-150 ${
              isActive
                ? 'text-slate-900 font-bold'
                : 'font-medium text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5'
            }`}
          >
            {label}
          </span>
        )}
      </span>

      {/* Right Numeric Counter */}
      {!isCollapsed && badge !== undefined && (
        <div className="relative z-10 flex items-center">
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono font-bold tabular-nums transition-colors ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/80'
            }`}
          >
            {badge}
          </span>
        </div>
      )}
    </button>
  );
};
export default SidebarNavItem;

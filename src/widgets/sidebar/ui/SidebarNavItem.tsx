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
      onClick={onClick}
      className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-[22px] transition-all duration-200 ease-out text-left group cursor-pointer ${
        isActive
          ? 'text-[#1D1D1F] font-bold shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] border border-black/[0.05]'
          : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]/60'
      }`}
    >
      {isActive && (
        <>
          {/* Luminous Elevated White Card Container */}
          <motion.div
            layoutId="sidebar-active-tab-highlight"
            transition={SNAPPY_SPRING}
            className="absolute inset-0 bg-[#F8F9FB] rounded-[22px] border border-black/[0.03]"
          />
          {/* Active Accent Left Border Indicator */}
          <span className="absolute left-0 top-3 bottom-3 w-[3.5px] bg-[#0071E3] rounded-r-full z-20 shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
        </>
      )}

      {/* Nav Content */}
      <span className="relative z-10 flex items-center gap-3.5 min-w-0">
        {/* Squircle Icon Tile */}
        <div
          className={`size-10 rounded-[14px] flex items-center justify-center transition-all duration-200 shrink-0 ${
            isActive
              ? 'bg-[#0071E3] text-white shadow-[0_4px_12px_rgba(0,113,227,0.35)]'
              : 'bg-[#F5F5F7] text-[#86868B] group-hover:bg-[#EBEBEF] group-hover:text-[#1D1D1F]'
          }`}
        >
          <Icon className={`size-5 transition-transform duration-200 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75] group-hover:scale-105'}`} />
        </div>

        {/* Text Label */}
        {!isCollapsed && (
          <span
            className={`truncate text-[13.5px] tracking-tight transition-colors ${
              isActive ? 'text-[#1D1D1F] font-bold' : 'font-medium text-[#6E6E73] group-hover:text-[#1D1D1F]'
            }`}
          >
            {label}
          </span>
        )}
      </span>

      {/* Right Indicator: Blue status dot or numeric badge */}
      {!isCollapsed && (
        <div className="relative z-10 flex items-center">
          {badge !== undefined ? (
            <span className="text-[10.5px] px-2 py-0.5 rounded-full font-bold tabular-nums bg-[#0071E3] text-white shadow-xs">
              {badge}
            </span>
          ) : isActive ? (
            /* Subtle blue status dot matching the design */
            <span className="size-2 rounded-full bg-[#0071E3] shadow-[0_0_6px_rgba(0,113,227,0.6)] shrink-0 mr-1" />
          ) : null}
        </div>
      )}
    </button>
  );
};
export default SidebarNavItem;

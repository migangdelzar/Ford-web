import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderBlockProps {
  icon: LucideIcon;
  title: string;
  badge?: string | number | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeaderBlock: React.FC<PageHeaderBlockProps> = ({
  icon: Icon,
  title,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-black/[0.05] ${className}`}
    >
      {/* Desktop Page Title (hidden on mobile < md where AppHeaderWidget already shows the active page title) */}
      <div className="hidden md:flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
          <Icon className="size-4.5 stroke-[2.25]" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xl font-display font-bold tracking-tight text-[#1D1D1F] truncate">
            {title}
          </h2>
          {badge !== undefined &&
            (typeof badge === 'string' || typeof badge === 'number' ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums bg-[#0071E3]/10 text-[#0071E3]">
                {badge}
              </span>
            ) : (
              badge
            ))}
        </div>
      </div>

      {/* Actions Toolbar: Full-width clean alignment on mobile, right-aligned on desktop */}
      {actions && (
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeaderBlock;

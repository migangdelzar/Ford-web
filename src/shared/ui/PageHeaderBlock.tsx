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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04] ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="size-7 sm:size-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
          <Icon className="size-4 sm:size-4.5 stroke-[2.25]" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight text-[#1D1D1F]">
            {title}
          </h1>
          {badge !== undefined && (
            typeof badge === 'string' || typeof badge === 'number' ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums bg-[#0071E3]/10 text-[#0071E3]">
                {badge}
              </span>
            ) : (
              badge
            )
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeaderBlock;

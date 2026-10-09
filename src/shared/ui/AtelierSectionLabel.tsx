import React from 'react';

interface AtelierSectionLabelProps {
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export const AtelierSectionLabel: React.FC<AtelierSectionLabelProps> = ({
  children,
  className = '',
  badge,
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 px-0.5 ${className}`}>
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#86868B] block">
        {children}
      </span>
      {badge && <div>{badge}</div>}
    </div>
  );
};

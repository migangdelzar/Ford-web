import React from 'react';

interface AtelierCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const AtelierCard: React.FC<AtelierCardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  };

  return (
    <div
      className={`rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

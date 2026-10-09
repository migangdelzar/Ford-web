import React, { useState } from 'react';
import { StatusDot, StatusDotVariant } from './StatusDot';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'squircle';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: StatusDotVariant;
  badge?: React.ReactNode;
  fallbackBg?: string;
  className?: string;
  alt?: string;
}

const sizeStyles: Record<
  AvatarSize,
  { container: string; text: string; statusOffset: string }
> = {
  xs: { container: 'size-6', text: 'text-[10px]', statusOffset: '-bottom-0.5 -right-0.5' },
  sm: { container: 'size-7 sm:size-8', text: 'text-xs', statusOffset: '-bottom-0.5 -right-0.5' },
  md: { container: 'size-9 sm:size-10', text: 'text-sm', statusOffset: '-bottom-0.5 -right-0.5' },
  lg: { container: 'size-11 sm:size-12', text: 'text-base', statusOffset: '-bottom-1 -right-1' },
  xl: { container: 'size-14 sm:size-16', text: 'text-lg', statusOffset: '-bottom-1 -right-1' },
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  shape = 'circle',
  status,
  badge,
  fallbackBg = 'bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.08]',
  className = '',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : '?';

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const { container, text, statusOffset } = sizeStyles[size];

  return (
    <div className={`relative inline-flex shrink-0 ${container} ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover shadow-2xs ${shapeClass}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold tracking-tight select-none shadow-2xs ${shapeClass} ${text} ${fallbackBg}`}
        >
          {initials}
        </div>
      )}

      {status && (
        <div className={`absolute ${statusOffset} z-10`}>
          <StatusDot status={status} size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />
        </div>
      )}

      {badge && <div className={`absolute ${statusOffset} z-10`}>{badge}</div>}
    </div>
  );
};

export default Avatar;

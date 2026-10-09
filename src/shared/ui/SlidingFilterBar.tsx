import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SNAPPY_SPRING } from '../lib/motion';

export interface FilterOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  color?: string;
}

interface SlidingFilterBarProps<T extends string> {
  options: FilterOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  layoutIdPrefix: string;
  size?: 'sm' | 'md';
  variant?: 'pills' | 'segmented' | 'cards';
  className?: string;
  showScrollControls?: boolean;
}

export function SlidingFilterBar<T extends string>({
  options,
  selectedId,
  onSelect,
  layoutIdPrefix,
  size = 'sm',
  variant = 'segmented',
  className = '',
  showScrollControls = false,
}: SlidingFilterBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [options]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = 140;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative flex items-center group select-none ${className}`}>
      {showScrollControls && canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-0 z-20 w-6 h-full flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent text-slate-500 hover:text-slate-900 transition-opacity"
          aria-label="Scroll filter left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className={`flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full p-1 rounded-xl transition-all ${
          variant === 'segmented'
            ? 'bg-slate-100/90 border border-slate-200/60 shadow-2xs'
            : 'bg-transparent'
        }`}
      >
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              id={`filter-opt-${layoutIdPrefix}-${option.id}`}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`relative shrink-0 flex items-center gap-1.5 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
              } ${
                isSelected
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${layoutIdPrefix}-active-bg`}
                  transition={SNAPPY_SPRING}
                  className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/60"
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected
                        ? option.color || 'text-slate-900'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <span
                    className={`text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {showScrollControls && canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 z-20 w-6 h-full flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent text-slate-500 hover:text-slate-900 transition-opacity"
          aria-label="Scroll filter right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

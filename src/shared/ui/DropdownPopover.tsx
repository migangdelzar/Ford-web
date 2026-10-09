import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SNAPPY_SPRING } from '../lib/motion';

export interface DropdownPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
}

export const DropdownPopover: React.FC<DropdownPopoverProps> = ({
  isOpen,
  onClose,
  trigger,
  children,
  align = 'right',
  width = 'w-64',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {trigger}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={SNAPPY_SPRING}
            className={`absolute top-full mt-2 ${alignClasses[align]} ${width} max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-3.5 z-50 ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownPopover;

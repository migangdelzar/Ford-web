import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { FLUID_SPRING } from '../lib/motion';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const toast = useCallback(({ type, title, description }: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="size-4 text-[#34C759] shrink-0" />,
          accentBar: 'bg-[#34C759]',
        };
      case 'error':
        return {
          icon: <AlertCircle className="size-4 text-[#FF3B30] shrink-0" />,
          accentBar: 'bg-[#FF3B30]',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="size-4 text-[#FF9500] shrink-0" />,
          accentBar: 'bg-[#FF9500]',
        };
      case 'info':
      default:
        return {
          icon: <Info className="size-4 text-[#0071E3] shrink-0" />,
          accentBar: 'bg-[#0071E3]',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Mobile Dynamic Island / Desktop Floating Stack */}
      <div
        id="sonner-toast-anchor"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-3 sm:top-auto sm:bottom-5 inset-x-3 sm:inset-x-auto sm:right-5 z-50 flex flex-col items-center sm:items-end pointer-events-none"
      >
        <div className="relative w-full max-w-sm sm:w-84">
          <AnimatePresence>
            {toasts.map((t, index) => {
              const reverseIndex = toasts.length - 1 - index;

              // 3D smooth stack calculation
              const yOffset = isHovered ? reverseIndex * -64 : reverseIndex * -8;
              const scale = isHovered ? 1 : 1 - reverseIndex * 0.03;
              const opacity = reverseIndex > 2 ? 0 : 1 - reverseIndex * 0.12;
              const { icon, accentBar } = getToastStyles(t.type);

              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.94 }}
                  animate={{
                    opacity,
                    y: yOffset,
                    scale,
                    zIndex: index + 10,
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -16, transition: { duration: 0.15 } }}
                  transition={FLUID_SPRING}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.y) > 40 || Math.abs(info.offset.x) > 50) {
                      removeToast(t.id);
                    }
                  }}
                  className="pointer-events-auto absolute top-0 sm:top-auto sm:bottom-0 left-0 right-0 p-3 rounded-2xl border border-black/[0.06] bg-white/95 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-start gap-2.5 transition-colors cursor-grab active:cursor-grabbing select-none overflow-hidden"
                >
                  {/* Vertical left accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

                  <div className="shrink-0 mt-0.5 ml-1">{icon}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1D1D1F] leading-snug">{t.title}</p>
                    {t.description && (
                      <p className="text-[11px] text-[#86868B] mt-0.5 leading-tight truncate">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToast(t.id);
                    }}
                    className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg hover:bg-black/[0.04] transition-colors active:scale-95 shrink-0"
                    title="Cerrar notificación"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

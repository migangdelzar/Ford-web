import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X, UserCheck } from 'lucide-react';
import { InspectorWidget } from '../../inspector/ui/InspectorWidget';
import { IconButton, IconBadge } from '../../../shared/ui';

interface ProspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProspectDrawer: React.FC<ProspectDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-stretch sm:justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-all"
            aria-hidden="true"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="sm:hidden relative w-full max-h-[88vh] bg-white shadow-2xl flex flex-col z-10 rounded-t-2xl border-t border-slate-200 overflow-hidden pb-[env(safe-area-inset-bottom,1rem)]"
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing bg-white">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <IconBadge icon={UserCheck} color="slate" size="xs" />
                <span className="text-xs font-bold text-slate-900">
                  {t('prospect.title')}
                </span>
              </div>

              <IconButton
                icon={X}
                size="xs"
                variant="ghost"
                onClick={onClose}
                tooltip="Cerrar"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              <InspectorWidget isDrawer />
            </div>
          </motion.div>

          {/* Desktop/Tablet Slide-over panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="hidden sm:flex relative w-full max-w-md bg-white shadow-2xl h-full flex-col z-10 border-l border-slate-200"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <IconBadge icon={UserCheck} color="slate" size="xs" />
                <span className="text-xs font-semibold text-slate-900">
                  {t('prospect.title')}
                </span>
              </div>

              <IconButton
                icon={X}
                size="xs"
                variant="ghost"
                onClick={onClose}
                tooltip="Cerrar ficha (Esc)"
              />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              <InspectorWidget isDrawer />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProspectDrawer;

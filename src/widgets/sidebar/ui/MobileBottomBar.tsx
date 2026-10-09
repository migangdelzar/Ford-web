import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Inbox,
  BarChart3,
  Activity,
  FlaskConical,
  SlidersHorizontal,
  ScrollText,
  LayoutGrid,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { FordBrandLogo } from '../../../shared/ui';
import { useScrollDirection } from '../../../shared/lib/useScrollDirection';
import { SNAPPY_SPRING } from '../../../shared/lib/motion';

export const MobileBottomBar: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    conversations,
    selectedConversationId,
    userRole,
  } = useCrmStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isVisible = useScrollDirection();
  const totalUnread = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  // Close menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // If inside an active conversation on mobile in Inbox, hide bottom bar for full messaging view
  if (activeTab === 'inbox' && selectedConversationId) {
    return null;
  }

  // Primary daily operation tabs (kept strictly to 3 required tabs for generous spacing)
  const primaryTabs = [
    {
      id: 'inbox' as const,
      label: t('nav.inbox', 'Bandeja'),
      icon: Inbox,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'metrics' as const,
      label: userRole === 'asesor' ? t('nav.myStats', 'Números') : t('nav.metrics', 'Métricas'),
      icon: BarChart3,
    },
    {
      id: 'service-status' as const,
      label: 'Servicios',
      icon: Activity,
    },
  ];

  // Secondary Administration & Tools tabs (inside the floating "Menú" sheet)
  const adminMenuItems = [
    {
      id: 'config' as const,
      label: t('nav.botRules', 'Reglas y Tono'),
      desc: 'Personalidad del Concierge IA y palabras clave de transferencia',
      icon: SlidersHorizontal,
    },
    {
      id: 'test-lab' as const,
      label: t('nav.testLab', 'Diagnóstico IA'),
      desc: 'Simulador de escenarios y evaluación de respuestas',
      icon: FlaskConical,
    },
    {
      id: 'events' as const,
      label: t('nav.events', 'Auditoría de Eventos'),
      desc: 'Registro inmutable de mensajes, webhooks y SLA',
      icon: ScrollText,
    },
  ];

  const isPropietario = userRole === 'propietario';
  const isSecondaryActive =
    activeTab === 'config' || activeTab === 'test-lab' || activeTab === 'events';

  const handleSelectTab = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Floating Fluid Popover / Sheet for Secondary & Admin Modules */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end px-3 pb-24">
            {/* Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/25 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Floating Glass Card above the fluid bottom bar */}
            <motion.div
              role="dialog"
              aria-label="Menú de Navegación"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={SNAPPY_SPRING}
              className="relative z-10 w-full max-w-md mx-auto bg-white/90 backdrop-blur-[24px] backdrop-saturate-[190%] rounded-[28px] border border-white/60 ring-1 ring-slate-900/8 shadow-[0_16px_44px_-8px_rgba(15,23,42,0.22)] p-4 select-none"
            >
              <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FordBrandLogo size="sm" variant="squircle" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      Módulos del Sistema
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      Navegación rápida y herramientas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="size-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar menú"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3.5 max-h-[60vh] overflow-y-auto">
                {/* Primary Operations Group */}
                <div>
                  <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Operación Diaria
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {primaryTabs.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectTab(item.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white/80 border-slate-200/70 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="relative">
                            <Icon className="size-4.5 stroke-[2]" />
                            {item.badge !== undefined && (
                              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#0071E3] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold mt-1 truncate w-full">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Administration Group (Propietario) */}
                {isPropietario && (
                  <div>
                    <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Administración y Diagnóstico
                    </span>
                    <div className="divide-y divide-slate-200/60 rounded-2xl border border-slate-200/70 bg-white/80 overflow-hidden">
                      {adminMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectTab(item.id)}
                            className={`w-full flex items-center justify-between gap-3 p-3 text-left transition-colors cursor-pointer ${
                              isActive ? 'bg-slate-900/[0.04]' : 'hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-bold truncate ${
                                    isActive ? 'text-slate-900' : 'text-slate-800'
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </div>

                            {isActive ? (
                              <Check className="size-4 text-[#0071E3] shrink-0" />
                            ) : (
                              <ChevronRight className="size-4 text-slate-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Fluid Glassmorphic Dock Navigation */}
      <AnimatePresence>
        {(isVisible || isMenuOpen) && (
          <motion.nav
            id="mobile-bottom-navigation"
            aria-label="Mobile Navigation"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto bg-white/80 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/50 ring-1 ring-slate-900/8 rounded-2xl shadow-[0_8px_32px_0_rgba(15,23,42,0.12)] px-1.5 py-1.5 select-none"
          >
            <div className="grid grid-cols-4 gap-1 items-center">
              {primaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id && !isMenuOpen;

                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-fluid-active-pill"
                        transition={SNAPPY_SPRING}
                        className="absolute inset-0 bg-slate-900 rounded-xl shadow-sm"
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-center">
                      <Icon
                        className={`size-4 transition-transform duration-150 ${
                          isActive ? 'scale-105 text-white stroke-[2.25]' : 'text-slate-500 stroke-[1.75]'
                        }`}
                      />
                      {tab.badge !== undefined && (
                        <span
                          className={`absolute -top-1.5 -right-2.5 min-w-3.5 h-3.5 px-1 rounded-full text-[8.5px] font-bold flex items-center justify-center tabular-nums shadow-2xs ${
                            isActive
                              ? 'bg-[#0071E3] text-white ring-1 ring-slate-900'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={`relative z-10 text-[10px] tracking-tight mt-0.5 truncate max-w-full ${
                        isActive ? 'font-bold text-white' : 'font-medium text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* 4th Fluid Slot: "Menú" button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                  isMenuOpen || isSecondaryActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {(isMenuOpen || isSecondaryActive) && (
                  <motion.div
                    layoutId="mobile-fluid-active-pill"
                    transition={SNAPPY_SPRING}
                    className="absolute inset-0 bg-slate-900 rounded-xl shadow-sm"
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <LayoutGrid
                    className={`size-4 transition-transform duration-150 ${
                      isMenuOpen || isSecondaryActive
                        ? 'scale-105 text-white stroke-[2.25]'
                        : 'text-slate-500 stroke-[1.75]'
                    }`}
                  />
                </div>

                <span
                  className={`relative z-10 text-[10px] tracking-tight mt-0.5 truncate max-w-full ${
                    isMenuOpen || isSecondaryActive
                      ? 'font-bold text-white'
                      : 'font-medium text-slate-600'
                  }`}
                >
                  Menú
                </span>
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
export default MobileBottomBar;

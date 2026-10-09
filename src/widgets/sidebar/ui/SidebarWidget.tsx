import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Inbox,
  BarChart3,
  Activity,
  FlaskConical,
  ScrollText,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { FordBrandLogo } from '../../../shared/ui';
import { useToast } from '../../../shared/ui/SonnerToast';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import { FLUID_SPRING } from '../../../shared/lib/motion';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarFooter } from './SidebarFooter';

export const SidebarWidget: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    conversations,
    resetAllData,
    userRole,
  } = useCrmStore();
  const { toast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalUnread = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  const handleConfirmReset = () => {
    resetAllData();
    setIsConfirmOpen(false);
    toast({
      type: 'info',
      title: t('nav.resetSimulator'),
      description: 'Datos originales del simulador restablecidos correctamente.',
    });
  };

  const navItems = [
    {
      id: 'inbox' as const,
      label: t('nav.inbox', 'Bandeja'),
      icon: Inbox,
      badge: totalUnread > 0 ? totalUnread : undefined,
      show: true,
    },
    {
      id: 'metrics' as const,
      label: userRole === 'asesor' ? t('nav.myStats', 'Mis Números') : t('nav.metrics', 'Métricas'),
      icon: BarChart3,
      show: true,
    },
    {
      id: 'service-status' as const,
      label: t('nav.serviceStatus', 'Estado de Servicios'),
      icon: Activity,
      show: true,
    },
    {
      id: 'test-lab' as const,
      label: t('nav.testLab', 'Diagnóstico'),
      icon: FlaskConical,
      show: userRole === 'propietario',
    },
    {
      id: 'config' as const,
      label: t('nav.botRules', 'Reglas y Tono'),
      icon: SlidersHorizontal,
      show: userRole === 'propietario',
    },
    {
      id: 'events' as const,
      label: t('nav.events', 'Auditoría'),
      icon: ScrollText,
      show: userRole === 'propietario',
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.show);

  return (
    <>
      <aside
        id="main-sidebar"
        className={`hidden md:flex shrink-0 bg-white border-r border-slate-200/70 flex-col justify-between select-none h-screen text-slate-600 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 overflow-hidden ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Brand Header aligned to 56px (h-14) to match AppHeaderWidget */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/70 shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <FordBrandLogo size="md" variant="squircle" />
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-0"
                >
                  <span className="font-display font-bold text-xs tracking-tight text-slate-900 block leading-tight truncate">
                    {t('brand.name', 'Ford')}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight truncate">
                    {t('brand.tagline', 'CRM de Ventas')}
                  </span>
                </motion.div>
              </div>
            ) : (
              <div className="mx-auto flex items-center justify-center">
                <FordBrandLogo size="md" variant="squircle" />
              </div>
            )}

            {!isCollapsed && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsCollapsed(true)}
                title="Contraer barra lateral"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <PanelLeftClose className="size-4 stroke-[1.75]" />
              </motion.button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="pt-3 flex justify-center shrink-0"
              >
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsCollapsed(false)}
                  title="Expandir barra lateral"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <PanelLeft className="size-4 stroke-[1.75]" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Navigation Menu (Unified fluid list so active highlight glides smoothly across all items) */}
          <nav aria-label="Main Navigation" className="p-3 space-y-1">
            {visibleNavItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeTab === item.id}
                isCollapsed={isCollapsed}
                badge={item.badge}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* Footer Shortcuts & Reset */}
        <SidebarFooter
          isCollapsed={isCollapsed}
          onResetData={() => setIsConfirmOpen(true)}
        />
      </aside>

      {/* Explicit Confirmation Dialog for Reset Simulator */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="¿Restablecer simulador?"
        description="Esta acción recargará las conversaciones originales, restablecerá la configuración del bot y vaciará los eventos locales de auditoría."
        confirmLabel="Sí, restablecer todo"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleConfirmReset}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
};
export default SidebarWidget;

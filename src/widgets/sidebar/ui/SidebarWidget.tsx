import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Inbox,
  BarChart3,
  Activity,
  FlaskConical,
  ScrollText,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { useToast } from '../../../shared/ui/SonnerToast';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
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

  const allNavItems = [
    {
      id: 'inbox' as const,
      label: t('nav.inbox', 'Bandeja'),
      icon: Inbox,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'metrics' as const,
      label: userRole === 'asesor' ? t('nav.myStats', 'Mis Números') : t('nav.metrics', 'Métricas'),
      icon: BarChart3,
    },
    {
      id: 'service-status' as const,
      label: t('nav.serviceStatus', 'Estado de Servicios'),
      icon: Activity,
    },
    {
      id: 'config' as const,
      label: t('nav.botRules', 'Reglas y Tono'),
      icon: SlidersHorizontal,
    },
    {
      id: 'test-lab' as const,
      label: t('nav.testLab', 'Diagnóstico'),
      icon: FlaskConical,
    },
    {
      id: 'events' as const,
      label: t('nav.events', 'Auditoría'),
      icon: ScrollText,
    },
  ];

  const primaryNavItems = allNavItems.filter((item) => {
    // Propietario has access to all sections
    if (userRole === 'propietario') return true;
    // Gerente and Asesor have access to inbox, metrics, and service-status
    if (userRole === 'gerente' || userRole === 'asesor') {
      return item.id === 'inbox' || item.id === 'metrics' || item.id === 'service-status';
    }
    return true;
  });

  return (
    <>
      <aside
        id="main-sidebar"
        className={`hidden md:flex shrink-0 bg-white border-r border-[#EEF0F3] flex-col justify-between select-none h-screen text-[#86868B] transition-all duration-200 ease-in-out z-20 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Atelier Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-[#EEF0F3]">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#409CFF] text-white flex items-center justify-center shadow-md shadow-[#0071E3]/20 shrink-0">
                  <Sparkles className="size-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-display font-bold text-sm tracking-tight text-[#1D1D1F] block leading-tight truncate">
                    {t('brand.name', 'Ford Uruapan')}
                  </span>
                  <span className="text-[10.5px] font-semibold text-[#86868B] block leading-tight mt-0.5 truncate">
                    {t('brand.tagline', 'Concierge IA')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="size-10 mx-auto rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#409CFF] text-white flex items-center justify-center shadow-md shadow-[#0071E3]/20 shrink-0">
                <Sparkles className="size-5" />
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              className="p-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <PanelLeft className="size-4 stroke-[1.75]" />
              ) : (
                <PanelLeftClose className="size-4 stroke-[1.75]" />
              )}
            </motion.button>
          </div>

          {/* Primary Navigation with Generous Spacing */}
          <div className="p-4 space-y-2">
            <div className="px-2 pt-1 pb-0.5">
              {!isCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#86868B]">
                  Menú
                </span>
              )}
            </div>

            {primaryNavItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeTab === item.id}
                isCollapsed={isCollapsed}
                badge={item.badge}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isCollapsed) setIsCollapsed(false);
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer Reset Button & Shortcuts */}
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

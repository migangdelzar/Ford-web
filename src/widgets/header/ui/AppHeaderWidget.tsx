import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Bell,
  BellRing,
  Activity,
  Inbox,
  BarChart3,
  FlaskConical,
  SlidersHorizontal,
  ScrollText,
  LucideIcon,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { Avatar, FordBrandLogo } from '../../../shared/ui';
import { useWebNotifications } from '../../../shared/lib/pwa';
import { EMIL_EASE } from '../../../shared/lib/motion';
import { NotificationsPopover } from './NotificationsPopover';
import { UserSettingsDrawer, UserSettingsTab } from './UserSettingsDrawer';

export const AppHeaderWidget: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    advisorProfile,
    selectedConversationId,
    conversations,
  } = useCrmStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<UserSettingsTab>('profile');
  const { isSubscribed } = useWebNotifications();

  const totalNotifications = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0) + (c.status === 'waiting' ? 1 : 0),
    0
  );

  const getActiveSectionMeta = (): { title: string; icon: LucideIcon } => {
    switch (activeTab) {
      case 'inbox':
        return { title: t('nav.inbox', 'Bandeja'), icon: Inbox };
      case 'metrics':
        return { title: t('nav.metrics', 'Métricas'), icon: BarChart3 };
      case 'service-status':
        return { title: t('nav.serviceStatus', 'Estado de Servicios'), icon: Activity };
      case 'test-lab':
        return { title: t('nav.testLab', 'Diagnóstico'), icon: FlaskConical };
      case 'config':
        return { title: t('nav.botRules', 'Reglas y Tono'), icon: SlidersHorizontal };
      case 'events':
        return { title: t('nav.events', 'Auditoría'), icon: ScrollText };
      default:
        return { title: t('nav.inbox', 'Bandeja'), icon: Inbox };
    }
  };

  const getStatusDotType = () => {
    switch (advisorProfile.status) {
      case 'available':
        return 'online' as const;
      case 'in_meeting':
        return 'busy' as const;
      case 'away':
        return 'away' as const;
      default:
        return 'online' as const;
    }
  };

  const getStatusText = () => {
    switch (advisorProfile.status) {
      case 'available':
        return t('header.statusAvailable', 'Disponible');
      case 'in_meeting':
        return t('header.statusMeeting', 'En Cita');
      case 'away':
        return t('header.statusAway', 'Ausente');
      default:
        return t('header.statusAvailable', 'Disponible');
    }
  };

  const openSettingsAt = (tab: UserSettingsTab) => {
    setIsNotificationsOpen(false);
    setSettingsInitialTab(tab);
    setIsSettingsDrawerOpen(true);
  };

  const { title: activeTitle, icon: ActiveSectionIcon } = getActiveSectionMeta();

  return (
    <>
      <header
        id="app-top-header"
        className={`sticky top-0 h-14 px-3.5 sm:px-5 bg-white/90 backdrop-blur-md border-b border-slate-200/75 items-center justify-between shrink-0 z-30 select-none gap-3 ${
          selectedConversationId && activeTab === 'inbox' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Left: Minimalist Ford Brand Emblem + Active Section Icon & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Mobile Brand Emblem + Desktop Breadcrumb Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <FordBrandLogo size="sm" variant="squircle" className="md:hidden" />
            <span className="text-xs font-semibold text-slate-400 truncate hidden sm:inline">
              {t('brand.name', 'Ford')}
            </span>
          </div>

          <span className="text-slate-300" aria-hidden="true">
            /
          </span>

          {/* Animated Active Section Icon + Title */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: EMIL_EASE }}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="size-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70 flex items-center justify-center shrink-0">
              <ActiveSectionIcon className="size-3.5 stroke-[2]" />
            </div>

            <h1 className="text-sm font-display font-bold text-slate-900 tracking-tight truncate">
              {activeTitle}
            </h1>

            {activeTab === 'inbox' && (
              <span className="text-xs font-mono font-semibold text-slate-400 tabular-nums shrink-0">
                ({conversations.length})
              </span>
            )}
          </motion.div>

          <span className="text-slate-300 hidden lg:inline" aria-hidden="true">
            ·
          </span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('service-status')}
            title="Ver Estado de Servicios & Spring Boot Actuator"
            className={`hidden lg:inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              activeTab === 'service-status'
                ? 'font-semibold text-[#0071E3]'
                : 'font-medium text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="size-3.5 text-emerald-600 shrink-0" />
            <span>{t('header.gatewayLive', 'Meta Cloud API')}</span>
          </motion.button>
        </div>

        {/* Right: Unified Notification Center & User Account Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notification Center Trigger */}
          <div className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              title="Centro de Notificaciones y Alertas Push"
              aria-label="Notificaciones"
              aria-expanded={isNotificationsOpen}
              className={`relative inline-flex items-center justify-center h-9 px-2.5 gap-1.5 rounded-xl border transition-colors cursor-pointer ${
                isNotificationsOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
            >
              {isSubscribed ? (
                <BellRing className="size-4 text-slate-700 shrink-0" />
              ) : (
                <Bell className="size-4 text-slate-600 shrink-0" />
              )}
              {totalNotifications > 0 && (
                <span className="text-xs font-mono font-bold text-[#0071E3] tabular-nums">
                  {totalNotifications}
                </span>
              )}
            </motion.button>

            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              onOpenSettings={() => openSettingsAt('notifications')}
            />
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" aria-hidden="true" />

          {/* Unified User Profile, Availability & Settings Trigger */}
          <motion.button
            id="user-profile-trigger"
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => openSettingsAt('profile')}
            aria-expanded={isSettingsDrawerOpen}
            aria-haspopup="dialog"
            className="inline-flex items-center gap-2.5 pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer text-left"
          >
            <Avatar
              name={advisorProfile.name}
              size="sm"
              shape="squircle"
              status={getStatusDotType()}
            />

            <div className="hidden sm:block min-w-0 leading-tight">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                {advisorProfile.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
                <span className="font-medium text-slate-600">{getStatusText()}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{advisorProfile.role}</span>
              </div>
            </div>

            <ChevronDown
              className={`size-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                isSettingsDrawerOpen ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </motion.button>
        </div>
      </header>

      {/* Unified User Profile, Notifications & Workspace Settings Drawer */}
      <UserSettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        initialTab={settingsInitialTab}
      />
    </>
  );
};

export default AppHeaderWidget;

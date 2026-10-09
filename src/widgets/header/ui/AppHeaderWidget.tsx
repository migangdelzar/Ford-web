import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, UserCheck, Bell, BellRing } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { UserMenuPopover } from './UserMenuPopover';
import { Badge, StatusDot } from '../../../shared/ui';
import { PWAInstallButton, useWebNotifications } from '../../../shared/lib/pwa';
import { useToast } from '../../../shared/ui/SonnerToast';

export const AppHeaderWidget: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab, advisorProfile, selectedConversationId, conversations } = useCrmStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isSubscribed, togglePushSubscription } = useWebNotifications();
  const { toast } = useToast();

  const totalNotifications = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0) + (c.status === 'waiting' ? 1 : 0),
    0
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'inbox':
        return t('nav.inbox');
      case 'metrics':
        return t('nav.metrics', 'Métricas & KPIs');
      case 'service-status':
        return t('nav.serviceStatus', 'Estado de Servicios');
      case 'test-lab':
        return t('nav.testLab');
      case 'config':
        return t('nav.botRules');
      case 'events':
        return t('nav.events');
      default:
        return t('nav.inbox');
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

  const handleFocusSearch = () => {
    const input = document.getElementById('thread-search-input') || document.getElementById('event-search-input');
    input?.focus();
  };

  return (
    <header
      id="app-top-header"
      className={`sticky top-0 h-13 px-4 bg-white/75 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-black/[0.06] items-center justify-between shrink-0 z-30 select-none gap-3 ${
        selectedConversationId && activeTab === 'inbox' ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="font-bold text-xs tracking-tight text-[#1D1D1F] truncate">
          {t('brand.name')}
        </span>

        <span className="text-[#86868B] font-normal">/</span>

        <span className="text-xs font-semibold text-[#1D1D1F] truncate">
          {getTabTitle()}
        </span>

        <button
          type="button"
          onClick={() => setActiveTab('service-status')}
          title="Ver Estado de Servicios & Spring Actuator"
          className="hidden lg:flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Badge variant="success" size="xs" dot>
            {t('header.gatewayLive')}
          </Badge>
        </button>
      </div>

      <div className="hidden md:flex flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={handleFocusSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EEF0F3] border border-black/[0.04] text-xs text-[#86868B] hover:text-[#1D1D1F] transition-colors shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-[#86868B]" />
            <span className="text-xs font-normal text-[#86868B]">{t('header.searchShortcut')}</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-[#86868B] border border-black/[0.06] shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="relative flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center">
          <PWAInstallButton compact />
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={async () => {
            const res = await togglePushSubscription();
            if (res === 'denied') {
              toast({
                type: 'warning',
                title: 'Permiso de notificaciones bloqueado en el navegador',
              });
            }
          }}
          title={isSubscribed ? 'Notificaciones Push Activas' : 'Activar Notificaciones Push (Web/PWA)'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            isSubscribed
              ? 'bg-[#EDF6F0] text-[#16A34A] border-[#16A34A]/20'
              : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] border-black/[0.06]'
          }`}
        >
          {isSubscribed ? (
            <BellRing className="size-3.5 text-[#16A34A] shrink-0" />
          ) : (
            <Bell className="size-3.5 shrink-0" />
          )}
          <span className="hidden xl:inline">{isSubscribed ? 'Push On' : 'Push Off'}</span>
        </motion.button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F7] border border-black/[0.04] text-[11px] text-[#1D1D1F] font-medium shrink-0 whitespace-nowrap">
          <StatusDot status={getStatusDotType()} size="xs" />
          <span className="truncate max-w-[120px]">
            {advisorProfile.status === 'available'
              ? t('header.statusAvailable')
              : advisorProfile.status === 'in_meeting'
              ? t('header.statusMeeting')
              : t('header.statusAway')}
          </span>
        </div>

        {/* Option 1: Compact Horizontal Chip + Notification Counter */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`inline-flex flex-row items-center gap-2 px-2.5 py-1 rounded-full border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            isUserMenuOpen
              ? 'bg-[#DCEBFF] border-[#0071E3]/40 shadow-xs'
              : 'bg-[#E8F1FF] hover:bg-[#DCEBFF] border-[#0071E3]/20 shadow-2xs'
          }`}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="true"
        >
          <UserCheck className="size-3.5 text-[#0071E3] shrink-0" />
          <span className="text-xs font-semibold text-[#1D1D1F] truncate max-w-[130px]">
            {advisorProfile.name}
          </span>
          <span className="inline-flex items-center justify-center bg-[#0071E3] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] rounded-full leading-none shadow-2xs">
            {totalNotifications}
          </span>
          <ChevronDown
            className={`size-3 text-[#0071E3] shrink-0 transition-transform duration-200 ${
              isUserMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </motion.button>

        <UserMenuPopover
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default AppHeaderWidget;

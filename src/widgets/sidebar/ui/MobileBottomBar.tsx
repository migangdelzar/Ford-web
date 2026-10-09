import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Inbox,
  BarChart3,
  Activity,
  FlaskConical,
  SlidersHorizontal,
  ScrollText,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
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

  const isVisible = useScrollDirection();
  const totalUnread = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  // If inside an active conversation on mobile in Inbox, hide bottom bar for full messaging view
  if (activeTab === 'inbox' && selectedConversationId) {
    return null;
  }

  const allTabs = [
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
    {
      id: 'config' as const,
      label: t('nav.botRules', 'Reglas'),
      icon: SlidersHorizontal,
    },
    {
      id: 'test-lab' as const,
      label: t('nav.testLab', 'Lab'),
      icon: FlaskConical,
    },
    {
      id: 'events' as const,
      label: t('nav.events', 'Eventos'),
      icon: ScrollText,
    },
  ];

  const tabs = allTabs.filter((tab) => {
    if (userRole === 'propietario') return true;
    if (userRole === 'gerente' || userRole === 'asesor') {
      return tab.id === 'inbox' || tab.id === 'metrics' || tab.id === 'service-status';
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          id="mobile-bottom-navigation"
          aria-label="Mobile Navigation"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/90 backdrop-blur-[24px] backdrop-saturate-[180%] border border-black/[0.06] rounded-[24px] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] px-2 py-1.5 select-none"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center py-1 px-2.5 min-w-[48px] rounded-2xl transition-all cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active-tab-bubble"
                        transition={SNAPPY_SPRING}
                        className="absolute -inset-1.5 bg-[#0071E3]/10 rounded-xl"
                      />
                    )}
                    <Icon
                      className={`relative z-10 size-4.5 transition-colors ${
                        isActive ? 'text-[#0071E3] stroke-[2.25]' : 'text-[#86868B] stroke-[1.75]'
                      }`}
                    />
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1 -right-2 z-20 min-w-3.5 h-3.5 px-1 rounded-full bg-[#0071E3] text-white text-[9px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`relative z-10 text-[10px] tracking-tight mt-0.5 transition-colors ${
                      isActive ? 'text-[#0071E3] font-bold' : 'text-[#86868B] font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SidebarWidget, MobileBottomBar, AppHeaderWidget } from './widgets';
import {
  LoginPage,
  InboxPage,
  DashboardPage,
  BotConfigPage,
  TestLabPage,
  EventLogPage,
  ServiceStatusPage,
} from './pages';
import { ToastProvider } from './shared/ui/SonnerToast';
import { useCrmStore } from './store/useCrmStore';
import { EMIL_EASE } from './shared/lib/motion';
import { CookieConsentBanner } from './features/compliance/ui/CookieConsentBanner';
import { LegalModal, LegalTab } from './features/compliance/ui/LegalModal';
import { Authority } from './shared/lib/authority';
import { useSseEvents } from './shared/lib/useSseEvents';
import { OfflineIndicator } from './shared/lib/pwa';

export function AppContent() {
  useSseEvents();

  const {
    isAuthenticated,
    activeTab,
    setActiveTab,
    conversations,
    selectedConversationId,
    selectConversation,
    channelFilter,
    userRole,
  } = useCrmStore();

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('privacy');

  // Enforce authoritative routing rules: if non-propietario is on a restricted tab, automatically fallback to inbox
  useEffect(() => {
    if (!isAuthenticated) return;
    if (userRole !== 'propietario') {
      if (activeTab === 'config' || activeTab === 'test-lab' || activeTab === 'events') {
        setActiveTab('inbox');
      }
    }
  }, [userRole, activeTab, isAuthenticated, setActiveTab]);

  // Keyboard Navigation: J / K and Cmd+K (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+K or Ctrl+K -> Focus thread search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('thread-search-input') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // J / K thread navigation
      const visibleConvs = conversations.filter(
        (c: any) => channelFilter === 'all' || c.channel === channelFilter
      );
      if (visibleConvs.length === 0) return;

      const currentIndex = visibleConvs.findIndex((c: any) => c.id === selectedConversationId);

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < visibleConvs.length - 1 ? currentIndex + 1 : 0;
        selectConversation(visibleConvs[nextIndex].id);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleConvs.length - 1;
        selectConversation(visibleConvs[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, conversations, selectedConversationId, channelFilter, selectConversation]);

  // If not logged in, enforce the official Login Portal flow
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onOpenLegalModal={(tab) => {
            setLegalModalTab(tab);
            setLegalModalOpen(true);
          }}
        />

        {/* Global Legal & Regulatory Modal */}
        <LegalModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalModalTab}
        />

        {/* Cookie Consent Banner */}
        <CookieConsentBanner
          onOpenCookiesPolicy={() => {
            setLegalModalTab('cookies');
            setLegalModalOpen(true);
          }}
        />
      </>
    );
  }

  const isPropietario = userRole === 'propietario';

  return (
    <div
      id="meta-crm-lab-root"
      className="flex h-screen w-screen overflow-hidden bg-white antialiased font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900"
    >
      {/* Permanent Left Navigation Sidebar */}
      <SidebarWidget />

      {/* Main Content Pane with Emil Kowalski smooth view transition */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Universal Top Header with Logged-in User Profile & Meta Live Status */}
        <AppHeaderWidget />

        {/* Keep views mounted or render with instant responsive transitions */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'inbox' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
            <InboxPage />
          </div>

          <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'metrics' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
            <DashboardPage />
          </div>

          <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'service-status' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
            <ServiceStatusPage />
          </div>

          {isPropietario && (
            <>
              <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'config' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
                <BotConfigPage />
              </div>

              <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'test-lab' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
                <TestLabPage />
              </div>

              <div className={`flex-1 flex h-full overflow-hidden transition-opacity duration-150 ${activeTab === 'events' ? 'block opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
                <EventLogPage />
              </div>
            </>
          )}
        </div>
      </main>

      {/* iOS/Material Mobile Bottom Navigation */}
      <MobileBottomBar />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Compliance: Cookie Consent Banner */}
      <CookieConsentBanner
        onOpenCookiesPolicy={() => {
          setLegalModalTab('cookies');
          setLegalModalOpen(true);
        }}
      />

      {/* Compliance: Global Legal & Regulatory Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

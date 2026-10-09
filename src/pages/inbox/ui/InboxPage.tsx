import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrmStore } from '../../../store/useCrmStore';
import { ThreadListWidget } from '../../../widgets/thread-list/ui/ThreadListWidget';
import { ConversationWidget } from '../../../widgets/conversation/ui/ConversationWidget';
import { InspectorWidget } from '../../../widgets/inspector/ui/InspectorWidget';
import { ProspectDrawer } from '../../../widgets/inspector/ui/ProspectDrawer';
import { EMIL_EASE } from '../../../shared/lib/motion';

export const InboxPage: React.FC = () => {
  const { isInspectorOpen, setIsInspectorOpen, selectedConversationId, crmDataError, fetchConversations, tenantIds, activeTenantId, selectTenant } = useCrmStore();

  return (
    <div id="inbox-page" className="flex-1 flex h-full overflow-hidden relative">
      {crmDataError && (
        <div role="alert" className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <span>{crmDataError}</span>
          <button type="button" className="font-semibold underline" onClick={() => void fetchConversations()}>Reintentar</button>
        </div>
      )}
      {tenantIds.length > 1 && (
        <label className="absolute right-3 top-12 z-20 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm">
          Sucursal
          <select aria-label="Sucursal" className="max-w-48 bg-transparent" value={activeTenantId ?? ''} onChange={(event) => selectTenant(event.target.value)}>
            <option value="">Seleccionar…</option>
            {tenantIds.map((tenantId, index) => <option key={tenantId} value={tenantId}>Sucursal {index + 1} · {tenantId.slice(0, 8)}</option>)}
          </select>
        </label>
      )}
      {/* Desktop Split View: Thread list on left */}
      <div className="hidden md:flex h-full shrink-0 md:w-72 lg:w-80 xl:w-[340px] border-r border-slate-200/80">
        <ThreadListWidget />
      </div>

      {/* Desktop Split View: Active Conversation in center */}
      <div className="hidden md:flex flex-1 h-full overflow-hidden">
        <ConversationWidget />
      </div>

      {/* Mobile Dynamic View with Native Push-Pop Transitions */}
      <div className="flex md:hidden flex-1 h-full overflow-hidden relative w-full">
        <AnimatePresence initial={false} mode="wait">
          {!selectedConversationId ? (
            <motion.div
              key="mobile-thread-list"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18, ease: EMIL_EASE }}
              className="flex-1 h-full w-full"
            >
              <ThreadListWidget />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-conversation-pane"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18, ease: EMIL_EASE }}
              className="flex-1 h-full w-full flex flex-col"
            >
              <ConversationWidget />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Persistent Inspector (only on >= 2xl screens when open) */}
      {isInspectorOpen && (
        <div className="hidden 2xl:flex h-full shrink-0 w-80">
          <InspectorWidget />
        </div>
      )}

      {/* Slide-Over Drawer for mobile/tablet/laptop */}
      <ProspectDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
};

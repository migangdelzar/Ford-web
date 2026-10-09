import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrmStore } from '../../../store/useCrmStore';
import { ThreadListWidget } from '../../../widgets/thread-list/ui/ThreadListWidget';
import { ConversationWidget } from '../../../widgets/conversation/ui/ConversationWidget';
import { InspectorWidget } from '../../../widgets/inspector/ui/InspectorWidget';
import { ProspectDrawer } from '../../../widgets/inspector/ui/ProspectDrawer';
import { EMIL_EASE } from '../../../shared/lib/motion';

export const InboxPage: React.FC = () => {
  const { isInspectorOpen, setIsInspectorOpen, selectedConversationId } = useCrmStore();

  return (
    <div id="inbox-page" className="flex-1 flex h-full overflow-hidden relative">
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

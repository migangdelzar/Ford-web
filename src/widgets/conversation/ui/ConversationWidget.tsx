import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronRight } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { TypingIndicator } from '../../../entities/message/ui/TypingIndicator';
import { MessageBubble } from '../../../entities/message/ui/MessageBubble';
import { ConversationHeader } from '../../../entities/conversation/ui/ConversationHeader';
import { OmniComposer } from '../../../features/composer/ui/OmniComposer';
import { useToast } from '../../../shared/ui/SonnerToast';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import { restartConversationContext } from '../../../shared/api/operatorCrmApi';
import { ShadowDraftReviewPanel } from './ShadowDraftReviewPanel';

const getDateLabel = (isoDate: string, t: (k: string) => string, lang: string) => {
  const date = new Date(isoDate);
  const now = new Date();

  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t('conversation.today');
  }
  if (diffDays === 1) {
    return t('conversation.yesterday');
  }

  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const ConversationWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    selectedConversationId,
    conversations,
    messages,
    setTakeover,
    toggleTakeover,
    sendAgentMessage,
    isAiTyping,
    selectedMessageId,
    setSelectedMessageId,
    fastForward24Hours,
    reopen24HourWindow,
    retryFailedMessage,
    selectConversation,
    toggleInspector,
    isInspectorOpen,
    activeTenantId,
    isAuthenticated,
    fetchConversations,
  } = useCrmStore();
  const { toast } = useToast();
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // Touch Gesture tracking for mobile back navigation & drawer swipe
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swipeBackProgress, setSwipeBackProgress] = useState(0);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [isRestartingMemory, setIsRestartingMemory] = useState(false);

  const currentConv = conversations.find((c: any) => c.id === selectedConversationId);
  const convMessages = messages.filter((m: any) => m.conversationId === selectedConversationId);

  const restartMemory = async () => {
    if (!currentConv || !activeTenantId || currentConv.version === undefined || !isAuthenticated) {
      toast({ type: 'error', title: t('conversation.restartFailed'), description: t('conversation.restartNeedsAuth') });
      setIsRestartConfirmOpen(false);
      return;
    }
    setIsRestartingMemory(true);
    try {
      await restartConversationContext(activeTenantId, currentConv.id, currentConv.version);
      await fetchConversations();
      setIsRestartConfirmOpen(false);
      toast({ type: 'success', title: t('conversation.restartSuccess'), description: t('conversation.transcriptPreserved') });
    } catch (error) {
      toast({
        type: 'error',
        title: t('conversation.restartFailed'),
        description: error instanceof Error ? error.message : t('conversation.restartRetry'),
      });
    } finally {
      setIsRestartingMemory(false);
    }
  };

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, isAiTyping]);

  // Tactile keyboard shortcuts (⌘J for Bot/Human takeover, ⌘I for Ficha slider)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (currentConv) {
          toggleTakeover(currentConv.id);
          toast({
            type: 'info',
            title: currentConv.status === 'bot' ? `${t('takeover.advisor')} (⌘J)` : `${t('takeover.botActive')} (⌘J)`,
            description: currentConv.status === 'bot' ? t('composer.placeholderAdvisor') : t('takeover.botActive'),
          });
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleInspector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentConv, toggleTakeover, toggleInspector, toast, t]);

  // Mobile Touch Gestures:
  // 1. Swipe Right from left edge -> Go back to list
  // 2. Swipe Left from right edge -> Open Ficha del Prospecto
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    // Only consider horizontal edge gestures
    if (touchStartRef.current.x < 60 && deltaX > 0 && Math.abs(deltaY) < 50) {
      setSwipeBackProgress(Math.min(1, deltaX / 100));
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Edge Swipe Right to Go Back (like iOS / Android back gesture)
    if (touchStartRef.current.x < 70 && deltaX > 60 && Math.abs(deltaY) < 60 && duration < 500) {
      selectConversation(null);
    }
    // Edge Swipe Left to Open Ficha del Prospecto
    else if (
      touchStartRef.current.x > window.innerWidth - 70 &&
      deltaX < -60 &&
      Math.abs(deltaY) < 60 &&
      duration < 500
    ) {
      if (!isInspectorOpen) {
        toggleInspector();
      }
    }

    setSwipeBackProgress(0);
    touchStartRef.current = null;
  }, [selectConversation, isInspectorOpen, toggleInspector]);

  if (!currentConv) {
    return (
      <div className="flex-1 bg-[#F5F6FA] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-3">
          <Bot className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-extrabold text-slate-700">{t('conversation.noSelected')}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{t('conversation.selectPrompt')}</p>
      </div>
    );
  }

  return (
    <div
      id="conversation-pane"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 flex flex-col h-full bg-[#F5F6FA] overflow-hidden relative select-auto"
    >
      {/* Mobile Swipe-to-Back Edge Feedback Indicator */}
      {swipeBackProgress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: swipeBackProgress }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 md:hidden bg-slate-900/80 text-white p-2 rounded-r-2xl backdrop-blur-md shadow-lg flex items-center gap-1 text-xs pointer-events-none"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Volver</span>
        </motion.div>
      )}

      {/* Reusable Multi-Row Conversation Header */}
      <ConversationHeader
        conversation={currentConv}
        isInspectorOpen={isInspectorOpen}
        onBackClick={() => selectConversation(null)}
        onToggleTakeover={() => toggleTakeover(currentConv.id)}
        onSetTakeover={(mode) => setTakeover(currentConv.id, mode)}
        onRestartMemory={isAuthenticated && activeTenantId && currentConv.version !== undefined
          ? () => setIsRestartConfirmOpen(true) : undefined}
        isRestartingMemory={isRestartingMemory}
        onToggleInspector={toggleInspector}
        onReopenWindow={() => {
          reopen24HourWindow(currentConv.id);
          toast({
            type: 'info',
            title: t('conversation.windowReopen'),
            description: t('conversation.windowOpen'),
          });
        }}
        onSimulateExpire={() => {
          fastForward24Hours(currentConv.id);
          toast({
            type: 'warning',
            title: t('conversation.windowClosed'),
            description: t('composer.templatesTitle'),
          });
        }}
      />

      <ConfirmDialog
        isOpen={isRestartConfirmOpen}
        title={t('conversation.restartBotContext')}
        description={t('conversation.restartConfirmDescription')}
        confirmLabel={t('conversation.restartConfirm')}
        cancelLabel={t('common.cancel')}
        variant="warning"
        isLoading={isRestartingMemory}
        onConfirm={() => void restartMemory()}
        onClose={() => setIsRestartConfirmOpen(false)}
      />

      {/* Messages Timeline with Date Grouping */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-1">
        {convMessages.map((msg: any, index: number) => {
          const prevMsg = index > 0 ? convMessages[index - 1] : null;
          const showDateDivider =
            !prevMsg ||
            new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
          const dateLabel = showDateDivider ? getDateLabel(msg.timestamp, t, i18n.language) : null;

          return (
            <React.Fragment key={msg.id}>
              {/* Centered Date Group Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-4 py-1 select-none">
                  <div className="h-px bg-slate-200/90 flex-1 max-w-[80px]" />
                  <span className="mx-3 px-3 py-1 bg-white border border-slate-200/90 text-slate-500 rounded-full text-[11px] font-medium tracking-wide shadow-2xs">
                    {dateLabel}
                  </span>
                  <div className="h-px bg-slate-200/90 flex-1 max-w-[80px]" />
                </div>
              )}

              <MessageBubble
                message={msg}
                conversation={currentConv}
                isSelected={selectedMessageId === msg.id}
                onSelectBotMessage={(id) => {
                  setSelectedMessageId(id);
                  if (!isInspectorOpen) {
                    toggleInspector();
                  }
                }}
                onRetryFailed={(id) => retryFailedMessage(id)}
              />
            </React.Fragment>
          );
        })}

        <AnimatePresence>
          {isAiTyping && <TypingIndicator key="typing-indicator" />}
        </AnimatePresence>

        <div ref={scrollBottomRef} />
      </div>

      <ShadowDraftReviewPanel
        tenantId={activeTenantId}
        conversationId={currentConv.id}
        isAuthenticated={isAuthenticated}
      />

      {/* OmniComposer */}
      <OmniComposer
        conversationId={currentConv.id}
        customerName={currentConv.customerName}
        isHumanControlled={currentConv.status === 'human'}
        isWindowOpen={currentConv.isWindowOpen}
        onSendMessage={(text, isNote) => sendAgentMessage(currentConv.id, text, isNote)}
      />
    </div>
  );
};

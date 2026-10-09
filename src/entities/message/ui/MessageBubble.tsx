import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  Bot,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { Message, Conversation } from '../../../types';
import { ChannelAvatar } from '../../conversation/ui/ChannelAvatar';
import { DeliveryTick } from './DeliveryTick';
import { bubbleEntryVariant } from '../../../shared/lib/motion';
import { useCrmStore } from '../../../store/useCrmStore';
import { Authority } from '../../../shared/lib/authority';

interface MessageBubbleProps {
  message: Message;
  conversation: Conversation;
  isSelected?: boolean;
  onSelectBotMessage?: (messageId: string) => void;
  onRetryFailed?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  conversation,
  isSelected = false,
  onSelectBotMessage,
  onRetryFailed,
}) => {
  const { t } = useTranslation();
  const { userRole } = useCrmStore();
  const [showTelemetry, setShowTelemetry] = useState(false);

  const isPropietario = Authority.canViewDeepAiTelemetry(userRole);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─────────────────────────────────────────────────────────────
  // 1. INTERNAL NOTE: Full-width dashed-border banner style
  // Spans the full width of the chat stream with distinct dashed border
  // ─────────────────────────────────────────────────────────────
  if (message.isInternalNote || message.sender === 'system') {
    return (
      <motion.div
        variants={bubbleEntryVariant}
        initial="initial"
        animate="animate"
        className="my-3 w-full"
      >
        <div className="w-full bg-[#FFFBEB] border-2 border-dashed border-amber-300 rounded-xl p-3 sm:p-3.5 text-amber-950 shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/70 pb-1.5 mb-2 text-xs font-semibold text-amber-900">
            <div className="flex items-center gap-1.5 uppercase tracking-wide text-[10px] font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{t('conversation.internalNoteBanner', 'Nota Interna')}</span>
            </div>
            <span className="text-[10px] text-amber-700/80 font-mono tabular-nums">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-950 font-normal whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CLIENT MESSAGE: Left-aligned, pure crisp white, clean border
  // Customer avatar on left; no redundant header text inside bubble
  // ─────────────────────────────────────────────────────────────
  if (message.sender === 'customer') {
    return (
      <motion.div
        variants={bubbleEntryVariant}
        initial="initial"
        animate="animate"
        className="flex justify-start items-end gap-2.5 my-2.5 group"
      >
        {/* Customer Avatar on left */}
        <div className="shrink-0 mb-1">
          <ChannelAvatar
            avatarUrl={conversation.avatarUrl}
            name={conversation.customerName}
            channel={conversation.channel}
            size="sm"
          />
        </div>

        <div className="max-w-[85%] sm:max-w-[75%]">
          {message.unsupportedMedia && (
            <div className="mb-1.5 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{t('message.clientMedia', 'Archivo multimedia adjunto')}</span>
            </div>
          )}

          {/* Crisp White Bubble */}
          <div className="bg-white text-slate-900 rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-2xs border border-slate-200/90 hover:border-slate-300 transition-colors">
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-900 font-normal">
              {message.content}
            </p>

            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 font-mono tabular-nums">
              <span>{formatTime(message.timestamp)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BOT MESSAGE: Right-aligned, distinct light tint, bot avatar
  // Light tint (#F1F5F9) background with clear bot indicator
  // ─────────────────────────────────────────────────────────────
  if (message.sender === 'bot') {
    return (
      <motion.div
        variants={bubbleEntryVariant}
        initial="initial"
        animate="animate"
        className="flex justify-end items-end gap-2.5 my-2.5"
      >
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div
            id={`bot-message-${message.id}`}
            className={`rounded-2xl rounded-br-xs px-4 py-2.5 border transition-all ${
              isSelected
                ? 'bg-[#EBF3F7] border-[#8FB7CB] ring-2 ring-[#8FB7CB]/30 shadow-xs'
                : 'bg-[#F1F5F9] border-[#CBD5E1] shadow-2xs'
            }`}
          >
            {/* Header: Clean Bot identity + Discreet ⓘ telemetry trigger */}
            <div className="text-[11px] text-slate-600 font-medium mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Bot className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('conversation.botConcierge', 'Bot Concierge')}</span>
              </div>

              {/* Click-to-reveal diagnostic trigger (Propietario / Admin only) */}
              {message.aiDebug && isPropietario && (
                <button
                  type="button"
                  onClick={() => setShowTelemetry(!showTelemetry)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title={showTelemetry ? t('conversation.hideTelemetry', 'Ocultar telemetría') : t('conversation.viewTelemetry', 'Ver telemetría')}
                  aria-label="Toggle AI telemetry"
                >
                  <Info className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">
                    {showTelemetry ? t('conversation.hideTelemetry', 'Ocultar') : t('conversation.telemetry', 'Telemetría')}
                  </span>
                  {showTelemetry ? (
                    <ChevronUp className="w-3 h-3 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3 h-3 shrink-0" />
                  )}
                </button>
              )}
            </div>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-normal">
              {message.content}
            </p>

            {/* Diagnostic Telemetry Accordion */}
            <AnimatePresence>
              {showTelemetry && message.aiDebug && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mt-2.5 pt-2.5 border-t border-slate-200 text-[11px] text-slate-700 space-y-1.5 bg-white/70 -mx-2 px-3 py-2 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Latencia:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {message.aiDebug.latencyMs} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Modelo:</span>
                    <span className="font-mono text-slate-700">{message.aiDebug.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tokens:</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      {message.aiDebug.tokensIn} in / {message.aiDebug.tokensOut} out
                    </span>
                  </div>
                  {message.aiDebug.handoffReason && (
                    <div className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                      <span className="font-semibold block">Motivo de derivación:</span>
                      <span>{message.aiDebug.handoffReason}</span>
                    </div>
                  )}

                  {onSelectBotMessage && (
                    <button
                      type="button"
                      onClick={() => onSelectBotMessage(message.id)}
                      className="w-full mt-1.5 py-1 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[10px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t('conversation.inspectSheet', 'Inspeccionar Ficha')}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer: Timestamp & Delivery Status */}
            <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-500 font-mono tabular-nums">
              <span>{formatTime(message.timestamp)}</span>
              <DeliveryTick
                status={message.status}
                onRetry={() => onRetryFailed?.(message.id)}
              />
            </div>
          </div>
        </div>

        {/* Bot Identity Avatar */}
        <div
          className="shrink-0 mb-1 w-7 h-7 rounded-full bg-slate-200 border border-slate-300/80 text-slate-700 flex items-center justify-center shadow-2xs"
          title={t('conversation.botConcierge', 'Bot')}
        >
          <Bot className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. HUMAN AGENT MESSAGE: Right-aligned, primary color tint
  // Primary brand tint (#EFF6FF, border #93C5FD) with advisor avatar
  // ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={bubbleEntryVariant}
      initial="initial"
      animate="animate"
      className="flex justify-end items-end gap-2.5 my-2.5"
    >
      <div className="max-w-[85%] sm:max-w-[75%] bg-[#EFF6FF] text-slate-900 border border-[#93C5FD] rounded-2xl rounded-br-xs px-4 py-2.5 shadow-2xs">
        {/* Header: Human Advisor */}
        <div className="text-[11px] text-[#0052B4] font-semibold mb-1 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
          <span>{t('conversation.advisorTitle', 'Asesor')}</span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal text-slate-900">
          {message.content}
        </p>

        {/* Footer: Timestamp & Delivery Status */}
        <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-[#0052B4] font-mono tabular-nums">
          <span>{formatTime(message.timestamp)}</span>
          <DeliveryTick
            status={message.status}
            onRetry={() => onRetryFailed?.(message.id)}
          />
        </div>
      </div>

      {/* Human Advisor Avatar */}
      <div
        className="shrink-0 mb-1 w-7 h-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-2xs"
        title={t('conversation.advisorTitle', 'Asesor')}
      >
        <User className="w-3.5 h-3.5 text-white" />
      </div>
    </motion.div>
  );
};

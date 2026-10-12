import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BadgeDollarSign,
  Car,
  FileText,
  Flame,
  Sun,
  Snowflake,
  RotateCcw,
} from 'lucide-react';
import { Conversation } from '../../../types';
import { ChannelAvatar } from './ChannelAvatar';
import { MetaWindowBadge } from './MetaWindowBadge';
import { BotControlSwitch } from '../../../features/takeover/ui/BotControlSwitch';
import { Authority } from '../../../shared/lib/authority';
import { IconButton } from '../../../shared/ui';

interface ConversationHeaderProps {
  conversation: Conversation;
  isInspectorOpen: boolean;
  onBackClick: () => void;
  onToggleTakeover: () => void;
  onSetTakeover?: (mode: 'bot' | 'human') => void;
  onToggleInspector: () => void;
  onReopenWindow: () => void;
  onSimulateExpire: () => void;
  onRestartMemory?: () => void;
  isRestartingMemory?: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  isInspectorOpen,
  onBackClick,
  onToggleTakeover,
  onSetTakeover,
  onToggleInspector,
  onReopenWindow,
  onSimulateExpire,
  onRestartMemory,
  isRestartingMemory = false,
}) => {
  const { t } = useTranslation();
  const attribution = Authority.getLeadAttribution(conversation);
  const isHumanHandled = conversation.status === 'human';

  return (
    <header className="bg-white border-b border-slate-200/80 shrink-0">
      {/* ── ROW 1: IDENTITY, BACK NAVIGATION & PRIMARY ACTIONS ── */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="md:hidden shrink-0">
            <IconButton
              icon={ArrowLeft}
              size="sm"
              variant="secondary"
              onClick={onBackClick}
              tooltip="Volver a la lista de chats"
            />
          </div>

          <ChannelAvatar
            avatarUrl={conversation.avatarUrl}
            channel={conversation.channel}
            name={conversation.customerName}
            size="md"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {conversation.customerName}
              </h2>
              {conversation.leadTemperature === 'hot' && (
                <span title="Prospecto Caliente" className="inline-flex">
                  <Flame className="size-3.5 text-rose-500 shrink-0" />
                </span>
              )}
              {conversation.leadTemperature === 'warm' && (
                <span title="Prospecto Tibio" className="inline-flex">
                  <Sun className="size-3.5 text-amber-500 shrink-0" />
                </span>
              )}
              {conversation.leadTemperature === 'cold' && (
                <span title="Prospecto Frío" className="inline-flex">
                  <Snowflake className="size-3.5 text-slate-400 shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 truncate">
              <span className="font-mono truncate max-w-[130px] sm:max-w-[200px]">
                {conversation.customerHandle}
              </span>
              {isHumanHandled && attribution.assignedAdvisor && (
                <>
                  <span className="text-slate-300 select-none" aria-hidden="true">·</span>
                  <span className="font-medium text-[#0071E3] truncate max-w-[110px] sm:max-w-[150px]">
                    {attribution.assignedAdvisor.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Unified across mobile & desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {conversation.status === 'bot' && onRestartMemory && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onRestartMemory}
              disabled={isRestartingMemory}
              title={t('conversation.restartBotContext')}
              aria-label={t('conversation.restartBotContext')}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2 rounded-xl text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-wait"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden xl:inline">{t('conversation.restartContext')}</span>
            </motion.button>
          )}
          <BotControlSwitch
            id="conversation-header"
            status={conversation.status}
            onToggle={onToggleTakeover}
            onSetMode={onSetTakeover}
            size="sm"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onToggleInspector}
            title={`${t('prospect.title')} (⌘I)`}
            className={`inline-flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isInspectorOpen
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
            }`}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">{t('conversation.sheet')}</span>
            <kbd
              className={`hidden lg:inline-block px-1 py-0.5 rounded text-[9px] font-mono ${
                isInspectorOpen ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              ⌘I
            </kbd>
          </motion.button>
        </div>
      </div>

      {/* ── ROW 2: COMPACT CONTEXT & SLA WINDOW BAR ── */}
      <div className="px-3 sm:px-5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 truncate">
          {conversation.extractedFields.interest ? (
            <span className="text-slate-800 font-medium truncate flex items-center gap-1.5">
              <Car className="size-3.5 text-[#0071E3] shrink-0" />
              <span className="truncate">{conversation.extractedFields.interest}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] truncate">Sin vehículo asignado</span>
          )}

          {conversation.extractedFields.budget && (
            <>
              <span className="text-slate-300 select-none" aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium truncate hidden xs:flex sm:flex items-center gap-1">
                <BadgeDollarSign className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{conversation.extractedFields.budget}</span>
              </span>
            </>
          )}
        </div>

        <div className="shrink-0">
          <MetaWindowBadge
            isOpen={conversation.isWindowOpen}
            onReopen={onReopenWindow}
            onSimulateExpire={onSimulateExpire}
          />
        </div>
      </div>
    </header>
  );
};

export default ConversationHeader;

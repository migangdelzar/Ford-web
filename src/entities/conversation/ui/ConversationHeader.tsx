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
  UserCheck,
} from 'lucide-react';
import { Conversation } from '../../../types';
import { ChannelAvatar } from './ChannelAvatar';
import { MetaWindowBadge } from './MetaWindowBadge';
import { BotControlSwitch } from '../../../features/takeover/ui/BotControlSwitch';
import { Authority } from '../../../shared/lib/authority';
import { IconButton, Badge } from '../../../shared/ui';

interface ConversationHeaderProps {
  conversation: Conversation;
  isInspectorOpen: boolean;
  onBackClick: () => void;
  onToggleTakeover: () => void;
  onSetTakeover?: (mode: 'bot' | 'human') => void;
  onToggleInspector: () => void;
  onReopenWindow: () => void;
  onSimulateExpire: () => void;
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
}) => {
  const { t } = useTranslation();
  const attribution = Authority.getLeadAttribution(conversation);
  const isHumanHandled = conversation.status === 'human';

  return (
    <header className="bg-white border-b border-black/[0.06] shrink-0 shadow-2xs">
      {/* ── ROW 1: PRIMARY IDENTITY, MOBILE BACK & DESKTOP ACTIONS ── */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
              <h2 className="text-xs sm:text-sm font-bold text-[#1D1D1F] truncate leading-snug">
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
                  <Snowflake className="size-3.5 text-slate-500 shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#86868B] font-mono truncate max-w-[120px] sm:max-w-[200px]">
                {conversation.customerHandle}
              </span>
              {isHumanHandled && attribution.assignedAdvisor && (
                <>
                  <span className="text-[#86868B] text-[10px] select-none">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F1FF] text-[#0071E3] border border-[#0071E3]/25 shrink-0 whitespace-nowrap shadow-2xs">
                    <UserCheck className="size-3 text-[#0071E3] shrink-0" />
                    <span className="truncate max-w-[120px]">{attribution.assignedAdvisor.name}</span>
                    <span className="inline-flex items-center justify-center bg-[#0071E3] text-white text-[9px] font-bold px-1.5 py-0.2 min-w-[16px] h-3.5 rounded-full shadow-2xs">
                      {conversation.unreadCount && conversation.unreadCount > 0 ? conversation.unreadCount : 1}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <BotControlSwitch
            id="desktop-header"
            status={conversation.status}
            onToggle={onToggleTakeover}
            onSetMode={onSetTakeover}
          />

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={onToggleInspector}
            title={`${t('prospect.title')} (⌘I)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isInspectorOpen
                ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] border-black/10 text-[#1D1D1F] shadow-2xs'
            }`}
          >
            <FileText className="size-3.5" />
            <span>{t('conversation.sheet')}</span>
            <kbd className={`hidden md:inline-block px-1 py-0.5 rounded text-[9px] font-mono ${
              isInspectorOpen ? 'bg-white/20 text-white' : 'bg-[#F5F5F7] text-[#86868B]'
            }`}>
              ⌘I
            </kbd>
          </motion.button>
        </div>

        <div className="flex sm:hidden items-center shrink-0">
          <IconButton
            icon={FileText}
            size="sm"
            variant={isInspectorOpen ? 'primary' : 'secondary'}
            onClick={onToggleInspector}
            tooltip={t('prospect.title')}
          />
        </div>
      </div>

      {/* ── ROW 2: CONTEXT & STATUS STRIP (Vehicle & Down payment) ── */}
      <div className="px-3 sm:px-4 py-1.5 bg-[#F5F5F7] border-t border-black/[0.04] flex items-center justify-between gap-2 text-xs text-[#1D1D1F]">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {conversation.extractedFields.interest && (
            <span className="text-[#1D1D1F] font-semibold truncate flex items-center gap-1 max-w-[180px] sm:max-w-[320px]">
              <Car className="size-3.5 text-[#0071E3] shrink-0" />
              <span className="truncate">{conversation.extractedFields.interest}</span>
            </span>
          )}

          {conversation.extractedFields.budget && (
            <>
              <span className="text-[#86868B] select-none" aria-hidden="true">·</span>
              <span className="text-[#248A3D] font-semibold truncate flex items-center gap-1">
                <BadgeDollarSign className="size-3.5 text-[#34C759] shrink-0" />
                <span className="truncate">{conversation.extractedFields.budget}</span>
              </span>
            </>
          )}
        </div>

        <div className="hidden sm:block shrink-0">
          <MetaWindowBadge
            isOpen={conversation.isWindowOpen}
            onReopen={onReopenWindow}
            onSimulateExpire={onSimulateExpire}
          />
        </div>
      </div>

      {/* ── ROW 3: MOBILE ONLY CONTROLS STRIP ── */}
      <div className="sm:hidden px-3 py-1.5 bg-white border-t border-black/[0.04] flex items-center justify-between gap-2">
        <MetaWindowBadge
          isOpen={conversation.isWindowOpen}
          onReopen={onReopenWindow}
          onSimulateExpire={onSimulateExpire}
        />

        <BotControlSwitch
          id="mobile-header"
          status={conversation.status}
          onToggle={onToggleTakeover}
          onSetMode={onSetTakeover}
          size="sm"
        />
      </div>
    </header>
  );
};

export default ConversationHeader;

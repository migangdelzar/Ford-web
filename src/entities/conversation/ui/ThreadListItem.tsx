import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, AlertTriangle, Bot, User, Flame, Sun, Snowflake } from 'lucide-react';
import { Conversation } from '../../../types';
import { ChannelAvatar } from './ChannelAvatar';
import { ListItem } from '../../../shared/ui';

interface ThreadListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  preview: string;
  onSelect: () => void;
  onToggleTakeover?: () => void;
}

export const ThreadListItem: React.FC<ThreadListItemProps> = ({
  conversation,
  isSelected,
  preview,
  onSelect,
  onToggleTakeover,
}) => {
  const { t } = useTranslation();

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isHuman = conversation.status === 'human';

  const getStatusConfig = () => {
    switch (conversation.status) {
      case 'waiting':
        return {
          icon: Clock,
          color: 'text-amber-600',
          label: t('takeover.requiresAdvisor', 'Atención'),
          pillClass: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80',
        };
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'text-rose-600',
          label: t('takeover.error', 'Error'),
          pillClass: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80',
        };
      case 'human':
        return {
          icon: User,
          color: 'text-[#007AFF]',
          label: t('takeover.advisor', 'Asesor'),
          pillClass: 'bg-blue-50 text-[#007AFF] hover:bg-blue-100/80 border border-blue-200/70',
        };
      case 'bot':
      default:
        return {
          icon: Bot,
          color: 'text-slate-600',
          label: t('takeover.botOnly', 'Bot'),
          pillClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200/80',
        };
    }
  };

  const statusMeta = getStatusConfig();
  const StatusIcon = statusMeta.icon;

  return (
    <ListItem
      size="md"
      active={isSelected}
      onClick={onSelect}
      className={`border-l-4 ${
        isSelected
          ? 'bg-[#EBF3FF] border-l-[#007AFF] border-y-black/[0.04]'
          : 'bg-white hover:bg-slate-50/90 border-l-transparent'
      }`}
      leading={
        <ChannelAvatar
          avatarUrl={conversation.avatarUrl}
          name={conversation.customerName}
          channel={conversation.channel}
          size="md"
        />
      }
      title={
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-xs truncate ${
                isSelected ? 'text-[#0F172A] font-bold' : 'text-[#1E293B] font-semibold'
              }`}
            >
              {conversation.customerName}
            </span>

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

          <span className="text-[10px] text-slate-500 font-mono tabular-nums shrink-0">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
      }
      subtitle={
        <div className="space-y-1.5 mt-0.5">
          <p className="text-xs text-slate-600 truncate leading-relaxed">
            {preview}
          </p>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTakeover?.();
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer shadow-2xs ${statusMeta.pillClass}`}
              title={
                isHuman
                  ? 'Atendido por Asesor humano (Click para transferir a Bot)'
                  : 'Atendido por Asistente Bot (Click para tomar control)'
              }
            >
              <StatusIcon className={`size-3 ${statusMeta.color} shrink-0`} />
              <span>{statusMeta.label}</span>
            </button>

            {conversation.unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#007AFF] text-white tabular-nums shadow-2xs">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      }
    />
  );
};

export default ThreadListItem;

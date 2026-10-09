import React from 'react';
import {
  Sparkles,
  AlertCircle,
  ArrowDownLeft,
  RefreshCw,
  UserCheck,
  LucideIcon,
} from 'lucide-react';
import { SystemEvent } from '../../../types';
import { AccordionItem, Badge, IconBadgeColor } from '../../../shared/ui';

export interface EventLogRowProps {
  event: SystemEvent;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const EventLogRow: React.FC<EventLogRowProps> = ({
  event,
  isExpanded,
  onToggleExpand,
}) => {
  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const getEventIconMeta = (event: SystemEvent): { icon: LucideIcon; color: IconBadgeColor } => {
    switch (event.eventType) {
      case 'error':
        return { icon: AlertCircle, color: 'rose' };
      case 'human_takeover':
        return { icon: UserCheck, color: 'amber' };
      case 'retry_triggered':
      case 'window_expired':
        return { icon: RefreshCw, color: 'orange' };
      case 'handoff_triggered':
        return { icon: UserCheck, color: 'green' };
      case 'incoming_message':
      case 'message_sent': {
        const isWa = event.channel === 'whatsapp';
        const isIg = event.channel === 'instagram';
        if (isWa) return { icon: ArrowDownLeft, color: 'blue' };
        if (isIg) return { icon: ArrowDownLeft, color: 'slate' };
        return { icon: ArrowDownLeft, color: 'amber' };
      }
      case 'ai_request':
      case 'ai_reply':
      default:
        return { icon: Sparkles, color: 'purple' };
    }
  };

  const { icon, color } = getEventIconMeta(event);

  const badgeContent = (
    <div className="flex items-center gap-1.5 shrink-0">
      {event.conversationName && (
        <Badge variant="tertiary" size="xs">
          {event.conversationName}
        </Badge>
      )}
      {event.latencyMs !== undefined && (
        <span className="text-[10px] font-mono text-[#86868B]">
          {event.latencyMs}ms
        </span>
      )}
      <span className="font-mono text-[10px] text-[#86868B] tabular-nums ml-1">
        {time}
      </span>
    </div>
  );

  return (
    <AccordionItem
      icon={icon}
      iconColor={color}
      isExpanded={isExpanded}
      onToggle={onToggleExpand}
      title={
        <span className="font-mono text-xs font-bold text-[#1D1D1F]">
          {event.eventType}
        </span>
      }
      subtitle={event.summary}
      badge={badgeContent}
    >
      <div className="p-3 bg-[#1D1D1F] text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto border border-black/10">
        <pre>{JSON.stringify(event.details, null, 2)}</pre>
      </div>
    </AccordionItem>
  );
};

export default EventLogRow;

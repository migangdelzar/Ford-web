import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Bot, User, Phone, Sparkles } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { LeadHeatSlider } from '../../../entities/conversation/ui/LeadHeatSlider';
import { CommercialRecommendationCard } from '../../../entities/conversation/ui/CommercialRecommendationCard';
import { PurchaseFileCard } from '../../../entities/conversation/ui/PurchaseFileCard';
import { AiTelemetrySection } from '../../../entities/message/ui/AiTelemetrySection';
import { useToast } from '../../../shared/ui/SonnerToast';
import { ROLE_AUTHORITIES } from '../../../shared/lib/authority';

interface InspectorWidgetProps {
  isDrawer?: boolean;
}

export const InspectorWidget: React.FC<InspectorWidgetProps> = ({ isDrawer = false }) => {
  const { t } = useTranslation();
  const {
    selectedConversationId,
    conversations,
    selectedMessageId,
    messages,
    userRole,
    updateLeadTemperature,
    updateExtractedFields,
    toggleTakeover,
  } = useCrmStore();
  const { toast } = useToast();

  const conv = conversations.find((c: any) => c.id === selectedConversationId);
  const convMessages = messages.filter((m: any) => m.conversationId === selectedConversationId);
  const targetMsg = selectedMessageId
    ? convMessages.find((m: any) => m.id === selectedMessageId)
    : [...convMessages].reverse().find((m: any) => m.sender === 'bot');

  if (!conv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-xs text-center">
        <UserCheck className="w-8 h-8 text-slate-300 mb-2" />
        <p className="font-medium text-slate-600">{t('prospect.noSelected')}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Selecciona una conversación para ver su ficha técnica.</p>
      </div>
    );
  }

  const roleConfig = ROLE_AUTHORITIES[userRole];

  const handleTakeoverToggle = () => {
    toggleTakeover(conv.id);
    const newStatus = conv.status === 'human' ? 'bot' : 'human';
    if (newStatus === 'human') {
      toast({
        type: 'info',
        title: 'Atención manual activada',
        description: 'El bot ha sido pausado. Puedes responder como asesor de ventas.',
      });
    } else {
      toast({
        type: 'info',
        title: 'Bot Ford Activado',
        description: 'El bot inteligente retoma la atención del prospecto.',
      });
    }
  };

  return (
    <div
      id="right-inspector-column"
      className={`${
        isDrawer ? 'w-full flex-1 bg-transparent' : 'w-80 shrink-0 border-l border-slate-200/80 bg-white'
      } flex flex-col h-full overflow-hidden text-slate-800`}
    >
      {/* ── 1. UNIFIED PROSPECT HEADER ── */}
      <div className="px-4 py-3.5 border-b border-slate-100 shrink-0 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
              {conv.customerName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-xs truncate">
              <span className="capitalize text-slate-600 font-medium">{conv.channel}</span>
              <span className="text-slate-300 select-none">·</span>
              <span className="font-mono text-[11px] truncate">{conv.customerHandle}</span>
            </div>
          </div>

          {/* Unified Role Tier Tag */}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 border border-slate-200/60">
            {roleConfig.badgeLabel}
          </span>
        </div>
      </div>

      {/* ── 2. SCROLLABLE ENTERPRISE SECTIONS ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* Section A: Lead Temperature & Strategic Recommendation */}
        <div className="p-4 space-y-3">
          <LeadHeatSlider
            temperature={conv.leadTemperature}
            onChange={(temp) => updateLeadTemperature(conv.id, temp)}
            source={conv.temperatureSource}
          />

          <CommercialRecommendationCard temperature={conv.leadTemperature} />
        </div>

        {/* Section B: Commercial Purchase File & Vehicle Valuation */}
        <div className="p-4">
          <PurchaseFileCard
            conversation={conv}
            onUpdateFields={(fields) => updateExtractedFields(conv.id, fields)}
          />
        </div>

        {/* Section C: Operational Takeover & Channel Control */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Control del Chat
            </span>
            <span
              className={`text-[10px] font-medium flex items-center gap-1 ${
                conv.status === 'human' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  conv.status === 'human' ? 'bg-blue-600' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span>{conv.status === 'human' ? 'Atención Humana' : 'Bot Activo'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleTakeoverToggle}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              conv.status === 'bot'
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200'
            }`}
          >
            {conv.status === 'bot' ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>{t('takeover.takeChat', 'Tomar Chat')}</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5" />
                <span>{t('takeover.switchToBot', 'Activar Bot')}</span>
              </>
            )}
          </button>
        </div>

        {/* Section D: AI Telemetry & Diagnostic (Progressive Disclosure) */}
        <div className="p-4">
          <AiTelemetrySection message={targetMsg} />
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Cpu } from 'lucide-react';
import { Message } from '../../../types';
import { useCrmStore } from '../../../store/useCrmStore';
import { Authority } from '../../../shared/lib/authority';
import { IconBadge, DataKeyValue } from '../../../shared/ui';

interface AiTelemetrySectionProps {
  message?: Message;
}

export const AiTelemetrySection: React.FC<AiTelemetrySectionProps> = ({ message }) => {
  const { t } = useTranslation();
  const { userRole } = useCrmStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!message?.aiDebug) return null;

  const isPropietario = Authority.canViewDeepAiTelemetry(userRole);

  // Hide AI message telemetry for non-owner/non-admin roles (gerente, asesor)
  if (!isPropietario) return null;

  const modelLabel = message.aiDebug.model.replace(/^gemini-/, 'Concierge ').replace('-flash', ' Flash');

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs text-[#86868B] hover:text-[#1D1D1F] py-1.5 px-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <IconBadge icon={Cpu} color="purple" size="xs" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
            {t('prospect.aiTelemetry')}
          </span>
          <span className="text-[10px] font-mono text-[#1D1D1F] bg-[#F5F5F7] px-1.5 py-0.2 rounded-md border border-black/[0.04]">
            {message.aiDebug.latencyMs}ms
          </span>
        </span>
        <div className="flex items-center gap-1 text-[#86868B]">
          <span className="text-[10px] font-mono">{modelLabel}</span>
          {isOpen ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 bg-[#F5F5F7] border border-black/[0.04] rounded-2xl space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <DataKeyValue
              label="Modelo"
              value={<span className="font-mono">{modelLabel}</span>}
              layout="vertical"
            />
            <DataKeyValue
              label="Latencia"
              value={<span className="font-mono">{message.aiDebug.latencyMs} ms</span>}
              layout="vertical"
            />

            {isPropietario && (
              <>
                <DataKeyValue
                  label="Tokens In/Out"
                  value={<span className="font-mono">{message.aiDebug.tokensIn} / {message.aiDebug.tokensOut}</span>}
                  layout="vertical"
                />
                <DataKeyValue
                  label="Temperatura"
                  value={<span className="font-mono">{message.aiDebug.temperature ?? 0.7}</span>}
                  layout="vertical"
                />
              </>
            )}
          </div>

          {message.aiDebug.handoffReason && (
            <div className="text-[11px] text-[#1D1D1F] bg-white p-2.5 rounded-xl border border-black/[0.04] leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-[#86868B] block mb-0.5">
                Criterio de Calificación:
              </span>
              {message.aiDebug.handoffReason}
            </div>
          )}

          {isPropietario && message.aiDebug.contextWindowSent && message.aiDebug.contextWindowSent.length > 0 && (
            <div className="pt-2 border-t border-black/[0.04] space-y-1">
              <span className="text-[10px] text-[#86868B] font-medium block">
                Historial enviado al modelo ({message.aiDebug.contextWindowSent.length} turnos):
              </span>
              <div className="max-h-24 overflow-y-auto bg-white p-2 rounded-xl text-[10px] font-mono text-[#1D1D1F] space-y-0.5 border border-black/[0.04]">
                {message.aiDebug.contextWindowSent.map((c, idx) => (
                  <div key={idx} className="truncate">
                    <span className="font-bold text-[#0071E3]">[{c.role}]:</span> {c.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiTelemetrySection;

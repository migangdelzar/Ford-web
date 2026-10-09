import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Sparkles,
  Car,
  BadgeDollarSign,
  ShieldAlert,
} from 'lucide-react';
import { ScenarioPreset, EvaluationResult } from './ScenarioCard';
import { LeadTempIcon } from '../../../entities/conversation/ui/LeadTempIcon';
import { BotStatusBadge } from '../../takeover/ui/BotStatusBadge';
import {
  Button,
  Card,
  EmptyState,
  Badge,
  AlertBanner,
  DataKeyValue,
} from '../../../shared/ui';

interface DiagnosticVerdictCardProps {
  selectedPreset: ScenarioPreset;
  activeResult?: EvaluationResult;
  isRunningScenario: boolean;
  onRunSelectedScenario: () => void;
}

export const DiagnosticVerdictCard: React.FC<DiagnosticVerdictCardProps> = ({
  selectedPreset,
  activeResult,
  isRunningScenario,
  onRunSelectedScenario,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="default" padding="md" className="space-y-4 shadow-xs bg-white">
      {/* Header with trigger button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EEF0F3]">
        <div>
          <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider block">
            {t('testLab.activeScenario')}
          </span>
          <h3 className="text-sm font-bold text-[#1C1E26] mt-0.5">
            {selectedPreset.title}
          </h3>
        </div>

        <Button
          variant="primary"
          size="sm"
          isLoading={isRunningScenario}
          leftIcon={<Play className="size-3 fill-current" />}
          onClick={onRunSelectedScenario}
        >
          {t('testLab.runSingle')}
        </Button>
      </div>

      {/* Input Prompt Quotation */}
      <div className="p-3 bg-[#F8F9FB] rounded-xl border border-[#EEF0F3] text-xs text-[#1C1E26] leading-relaxed font-mono">
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-sans font-semibold mb-1">
          <span>{t('testLab.simulatedCustomerMsg')}</span>
          <Badge variant="tertiary" size="xs">
            {selectedPreset.expectedHandoff ? 'Handoff esperado: Sí' : 'Handoff esperado: No'}
          </Badge>
        </div>
        "{selectedPreset.prompt}"
      </div>

      {/* Verdict Section */}
      {activeResult ? (
        <div className="space-y-4 pt-1">
          {/* Validation Compliance Banner using AlertBanner */}
          <AlertBanner
            type={activeResult.isHandoffAccurate ? 'success' : 'warning'}
            title={
              activeResult.isHandoffAccurate
                ? 'Cumplimiento Comercial Validado'
                : 'Derivación requiere calibración'
            }
            action={
              <span className="text-[11px] font-mono font-medium opacity-80">
                Latencia: {activeResult.latencyMs}ms
              </span>
            }
          />

          {activeResult.fallbackActive && (
            <div className="p-2 bg-[#F4F9FF] border border-[#007AFF]/10 text-[#007AFF] rounded-xl flex items-center justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                Motor local activo (Respaldo resiliente)
              </span>
              <span className="text-[9px] text-slate-400 font-normal">
                Servidor IA alta demanda
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Handoff Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                {t('testLab.handoffCriterion')}
              </span>
              <BotStatusBadge
                status={activeResult.handoffSuggested ? 'human' : 'bot'}
                size="sm"
              />
            </div>

            {/* Temperature */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                {t('testLab.leadScore')}
              </span>
              <LeadTempIcon
                temperature={activeResult.temperature}
                showLabel
                size="sm"
              />
            </div>

            {/* Latency */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                {t('testLab.decisionLatency')}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800">
                {activeResult.latencyMs} ms
              </span>
            </div>
          </div>

          {/* Extracted Commercial Fields using DataKeyValue */}
          {Object.keys(activeResult.extractedFields).length > 0 && (
            <div className="p-3.5 bg-[#F4F9FF] rounded-2xl border border-[#007AFF]/20 space-y-2">
              <span className="text-[10px] text-[#007AFF] uppercase font-bold flex items-center gap-1">
                <Sparkles className="size-3 text-[#007AFF]" />
                <span>{t('testLab.aiDetectedData')}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {activeResult.extractedFields.name && (
                  <DataKeyValue
                    label="Nombre / Name"
                    value={activeResult.extractedFields.name}
                    layout="vertical"
                  />
                )}
                {activeResult.extractedFields.interest && (
                  <DataKeyValue
                    label={t('prospect.unitInterest')}
                    value={
                      <span className="flex items-center gap-1 text-[#007AFF]">
                        <Car className="size-3.5" />
                        {activeResult.extractedFields.interest}
                      </span>
                    }
                    layout="vertical"
                  />
                )}
                {activeResult.extractedFields.budget && (
                  <DataKeyValue
                    label={t('prospect.budgetDown')}
                    value={
                      <span className="flex items-center gap-1 text-[#248A3D] font-mono">
                        <BadgeDollarSign className="size-3.5" />
                        {activeResult.extractedFields.budget}
                      </span>
                    }
                    layout="vertical"
                  />
                )}
                {activeResult.extractedFields.urgency && (
                  <DataKeyValue
                    label={t('prospect.detectedUrgency')}
                    value={<span className="capitalize">{activeResult.extractedFields.urgency}</span>}
                    layout="vertical"
                  />
                )}
              </div>
            </div>
          )}

          {/* Bot Reply Generated */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {t('testLab.generatedReply')}
            </span>
            <p className="text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 whitespace-pre-wrap">
              {activeResult.replyText}
            </p>
          </div>

          {activeResult.handoffReason && (
            <AlertBanner
              type="warning"
              icon={ShieldAlert}
              title={t('testLab.handoffReason')}
              description={activeResult.handoffReason}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={Play}
          title={t('testLab.readyToEval')}
          description={t('testLab.readyToEvalDesc')}
        />
      )}
    </Card>
  );
};

export default DiagnosticVerdictCard;

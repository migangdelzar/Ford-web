import React from 'react';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '../../../shared/ui/Badge';

export interface ScenarioPreset {
  id: string;
  category: 'cierre' | 'financiamiento' | 'asesor' | 'queja' | 'exploracion';
  title: string;
  subtitle: string;
  prompt: string;
  expectedTemperature: 'cold' | 'warm' | 'hot';
  expectedHandoff: boolean;
}

export interface EvaluationResult {
  id: string;
  presetId?: string;
  category?: string;
  inputPrompt: string;
  title: string;
  replyText: string;
  temperature: 'cold' | 'warm' | 'hot';
  handoffSuggested: boolean;
  handoffReason?: string;
  latencyMs: number;
  extractedFields: Record<string, string>;
  isHandoffAccurate: boolean;
  timestamp: string;
  fallbackActive?: boolean;
}

interface ScenarioCardProps {
  preset: ScenarioPreset;
  isSelected: boolean;
  result?: EvaluationResult;
  onSelect: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  preset,
  isSelected,
  result,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-white border-[#007AFF] ring-2 ring-[#007AFF]/15 shadow-xs'
          : 'bg-white/80 hover:bg-white border-[#EEF0F3] hover:border-slate-300'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0F0F12] truncate">
            {preset.title}
          </span>
          {preset.expectedHandoff && (
            <Badge variant="info" size="xs">
              Asesor
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{preset.subtitle}</p>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {result ? (
          result.isHandoffAccurate ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
          )
        ) : (
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        )}
      </div>
    </button>
  );
};

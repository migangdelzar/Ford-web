import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, Play, RotateCcw } from 'lucide-react';
import { ScenarioCard, ScenarioPreset, EvaluationResult } from '../../../features/test-lab/ui/ScenarioCard';
import { DiagnosticVerdictCard } from '../../../features/test-lab/ui/DiagnosticVerdictCard';
import { CustomTestInput } from '../../../features/test-lab/ui/CustomTestInput';
import { evaluateBotResponseLocally } from '../../../features/test-lab/lib/evaluator';
import { useCrmStore } from '../../../store/useCrmStore';
import { Button, PageHeaderBlock, AtelierSectionLabel } from '../../../shared/ui';
import { useToast } from '../../../shared/ui/SonnerToast';

const scenarioPresets: ScenarioPreset[] = [
  {
    id: 'scen-1',
    category: 'cierre',
    title: 'Interés de Compra Caliente',
    subtitle: 'Mustang GT 2025 - Enganche disponible',
    prompt:
      'Hola, me interesa muchísimo el Mustang GT 2025 color azul. Tengo $250,000 MXN listos para enganche hoy mismo, ¿puedo apartarlo o ir a verlo hoy?',
    expectedTemperature: 'hot',
    expectedHandoff: true,
  },
  {
    id: 'scen-2',
    category: 'asesor',
    title: 'Petición Explícita de Asesor',
    subtitle: 'Solicitud de contacto humano',
    prompt:
      'Prefiero no hablar con un bot, ¿me pueden comunicar con un asesor o una persona de ventas por favor?',
    expectedTemperature: 'warm',
    expectedHandoff: true,
  },
  {
    id: 'scen-3',
    category: 'financiamiento',
    title: 'Consulta de Crédito y Mensualidades',
    subtitle: 'Bronco Badlands - Plan tradicional',
    prompt:
      'Buenas tardes, ¿qué tasa de financiamiento tienen para la Bronco Badlands si doy un 30% de enganche a 48 meses?',
    expectedTemperature: 'warm',
    expectedHandoff: false,
  },
  {
    id: 'scen-4',
    category: 'queja',
    title: 'Reclamo o Servicio Posventa',
    subtitle: 'Demora en taller mecánico',
    prompt:
      'Llevo 3 días esperando que me entreguen mi Explorer de servicio y nadie me contesta el teléfono. Es una pésima atención.',
    expectedTemperature: 'cold',
    expectedHandoff: true,
  },
  {
    id: 'scen-5',
    category: 'exploracion',
    title: 'Exploración de Catálogo e Híbridos',
    subtitle: 'Interés en Maverick Hybrid',
    prompt:
      'Hola, quisiera saber qué rendimiento de gasolina da la Maverick Híbrida en ciudad y carretera.',
    expectedTemperature: 'cold',
    expectedHandoff: false,
  },
];

export const TestLabWidget: React.FC = () => {
  const { t } = useTranslation();
  const { botConfig } = useCrmStore();
  const { toast } = useToast();

  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarioPresets[0].id);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [isEvaluatingCustom, setIsEvaluatingCustom] = useState(false);

  const evaluateScenario = async (preset: ScenarioPreset): Promise<EvaluationResult> => {
    const startTime = performance.now();

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: preset.prompt,
          conversationHistory: [],
          customerName: 'Prospecto de Prueba',
          config: {
            systemPrompt: botConfig.systemPrompt,
            mode: botConfig.mode,
            handoffKeywords: botConfig.handoffKeywords,
          },
        }),
      });

      if (!resp.ok) throw new Error('Network error or server unavailable');
      const data = await resp.json();
      const endTime = performance.now();

      const evaluation: EvaluationResult = {
        id: `eval-${Date.now()}-${preset.id}`,
        presetId: preset.id,
        category: preset.category,
        inputPrompt: preset.prompt,
        title: preset.title,
        replyText: data.reply || 'Sin respuesta generada.',
        temperature: data.temperature || 'warm',
        handoffSuggested: !!data.handoffSuggested,
        handoffReason: data.handoffReason,
        latencyMs: Math.round(endTime - startTime),
        extractedFields: data.extractedFields || {},
        isHandoffAccurate: !!data.handoffSuggested === preset.expectedHandoff,
        timestamp: new Date().toISOString(),
      };

      return evaluation;
    } catch {
      const endTime = performance.now();
      const localResult = evaluateBotResponseLocally(
        preset.prompt,
        botConfig.handoffKeywords,
        botConfig.mode === 'off' ? 'autonomous' : 'autonomous'
      );

      return {
        id: `eval-${Date.now()}-${preset.id}`,
        presetId: preset.id,
        category: preset.category,
        inputPrompt: preset.prompt,
        title: preset.title,
        replyText: localResult.reply,
        temperature: localResult.temperature,
        handoffSuggested: localResult.handoffSuggested,
        handoffReason: localResult.handoffReason,
        latencyMs: Math.max(120, Math.round(endTime - startTime)),
        extractedFields: localResult.extractedFields,
        isHandoffAccurate: localResult.handoffSuggested === preset.expectedHandoff,
        timestamp: new Date().toISOString(),
        fallbackActive: true,
      };
    }
  };

  const handleRunSingleScenario = async (preset: ScenarioPreset) => {
    setIsRunningScenario(true);
    try {
      const res = await evaluateScenario(preset);
      setResults((prev) => [res, ...prev.filter((r) => r.presetId !== preset.id)]);
      toast({
        type: 'success',
        title: t('testLab.evaluated', 'Evaluación completada'),
        description: `Escenario "${preset.title}" diagnosticado con éxito.`,
      });
    } catch {
      toast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: 'No se pudo completar la prueba.',
      });
    } finally {
      setIsRunningScenario(false);
    }
  };

  const handleRunAllScenarios = async () => {
    setIsRunningAll(true);
    const newResults: EvaluationResult[] = [];

    for (const preset of scenarioPresets) {
      const res = await evaluateScenario(preset);
      newResults.push(res);
    }

    setResults(newResults);
    setIsRunningAll(false);
    toast({
      type: 'success',
      title: t('testLab.batchComplete', 'Batería finalizada'),
      description: `${scenarioPresets.length} escenarios fueron evaluados.`,
    });
  };

  const handleRunCustom = async (customPrompt: string) => {
    setIsEvaluatingCustom(true);
    const customPreset: ScenarioPreset = {
      id: `custom-${Date.now()}`,
      category: 'exploracion',
      title: 'Prueba Personalizada',
      subtitle: 'Entrada manual de diagnóstico',
      prompt: customPrompt,
      expectedTemperature: 'warm',
      expectedHandoff: false,
    };

    try {
      const res = await evaluateScenario(customPreset);
      setResults((prev) => [res, ...prev]);
      setActiveScenarioId(customPreset.id);
      toast({
        type: 'success',
        title: t('testLab.evaluated', 'Evaluación completada'),
        description: 'Diagnóstico generado para tu consulta personalizada.',
      });
    } catch {
      toast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: 'Fallo al procesar el mensaje personalizado.',
      });
    } finally {
      setIsEvaluatingCustom(false);
    }
  };

  const activeResult = results.find((r) => r.presetId === activeScenarioId) || results[0];

  return (
    <div id="test-lab-view" className="flex-1 overflow-y-auto bg-[#FBFBFD] p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Header using reusable PageHeaderBlock */}
        <PageHeaderBlock
          icon={FlaskConical}
          title={t('testLab.title', 'Diagnóstico')}
          actions={
            <>
              {results.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="size-3.5 text-slate-400" />}
                  onClick={() => setResults([])}
                  className="rounded-full border-black/[0.04] bg-white shadow-2xs text-xs px-3 py-1 cursor-pointer active:scale-95"
                >
                  {t('testLab.reset', 'Reiniciar')}
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                isLoading={isRunningAll}
                leftIcon={<Play className="size-3.5 fill-current" />}
                onClick={handleRunAllScenarios}
                disabled={isRunningScenario}
                className="rounded-full bg-[#0071E3] hover:bg-[#005bb5] shadow-2xs text-xs px-3.5 py-1 cursor-pointer active:scale-95"
              >
                {t('testLab.runAll', 'Ejecutar Batería')}
              </Button>
            </>
          }
        />

        {/* Split Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Preset Scenarios & Custom Input */}
          <div className="lg:col-span-5 space-y-3.5">
            <AtelierSectionLabel>
              {t('testLab.scenarioPreset', 'Casos Predefinidos')}
            </AtelierSectionLabel>

            <div className="space-y-2 sm:space-y-2.5">
              {scenarioPresets.map((preset) => (
                <ScenarioCard
                  key={preset.id}
                  preset={preset}
                  isSelected={preset.id === activeScenarioId}
                  result={results.find((r) => r.presetId === preset.id)}
                  onSelect={() => setActiveScenarioId(preset.id)}
                />
              ))}
            </div>

            <div className="pt-1">
              <CustomTestInput
                isLoading={isEvaluatingCustom}
                onEvaluate={handleRunCustom}
              />
            </div>
          </div>

          {/* Right Column: High-Fidelity Verdict & AI Diagnostic Card */}
          <div className="lg:col-span-7">
            <DiagnosticVerdictCard
              selectedPreset={
                scenarioPresets.find((p) => p.id === activeScenarioId) || {
                  id: activeScenarioId,
                  category: 'exploracion',
                  title: 'Prueba Personalizada',
                  subtitle: 'Evaluación manual',
                  prompt: activeResult?.inputPrompt || '',
                  expectedTemperature: 'warm',
                  expectedHandoff: false,
                }
              }
              activeResult={activeResult}
              isRunningScenario={isRunningScenario}
              onRunSelectedScenario={() => {
                const p = scenarioPresets.find((s) => s.id === activeScenarioId);
                if (p) handleRunSingleScenario(p);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

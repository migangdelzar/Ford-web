import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, Play, RotateCcw } from 'lucide-react';
import { ScenarioCard, ScenarioPreset, EvaluationResult } from '../../../features/test-lab/ui/ScenarioCard';
import { DiagnosticVerdictCard } from '../../../features/test-lab/ui/DiagnosticVerdictCard';
import { CustomTestInput } from '../../../features/test-lab/ui/CustomTestInput';
import { Button, PageHeaderBlock, AtelierSectionLabel } from '../../../shared/ui';
import { useToast } from '../../../shared/ui/SonnerToast';
import { useCrmStore } from '../../../store/useCrmStore';
import { sendAiTurn } from '../../../shared/api/fordServiceApi';

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
  const { toast } = useToast();
  const { advisorProfile, tenantIds } = useCrmStore();

  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarioPresets[0].id);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [isEvaluatingCustom, setIsEvaluatingCustom] = useState(false);
  const sessionStorageKey = `ford_testlab_conversation_id:${advisorProfile.id}`;
  const [tenantId, setTenantId] = useState('');
  const [conversationId, setConversationId] = useState(() => {
    const saved = localStorage.getItem(sessionStorageKey);
    const id = saved || crypto.randomUUID();
    localStorage.setItem(sessionStorageKey, id);
    return id;
  });
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantIds.length === 1) setTenantId(tenantIds[0]);
    else if (!tenantIds.includes(tenantId)) setTenantId('');
  }, [tenantIds.join(','), tenantId]);

  const evaluateScenario = async (preset: ScenarioPreset, sessionId: string = crypto.randomUUID()): Promise<EvaluationResult> => {
    const startTime = performance.now();
    if (tenantIds.length > 1 && !tenantId) throw new Error('Selecciona una agencia antes de ejecutar la prueba.');
    const data = await sendAiTurn({
      conversationId: sessionId,
      ...(tenantId ? { tenantId } : {}),
      messages: [{ role: 'user', content: preset.prompt }],
    });
    const endTime = performance.now();
    const temperature = String(data.suggestedTemperature || 'WARM').toLowerCase();
    const resultConversationId = data.conversationId || sessionId;
    return {
      id: `eval-${Date.now()}-${preset.id}`,
      presetId: preset.id,
      category: preset.category,
      inputPrompt: preset.prompt,
      title: preset.title,
      replyText: data.replyText || 'Sin respuesta generada.',
      temperature: (['cold', 'warm', 'hot'].includes(temperature) ? temperature : 'warm') as 'cold' | 'warm' | 'hot',
      handoffSuggested: Boolean(data.handoffSuggested),
      handoffReason: data.handoffReason,
      latencyMs: Math.round(endTime - startTime),
      extractedFields: {},
      isHandoffAccurate: Boolean(data.handoffSuggested) === preset.expectedHandoff,
      timestamp: new Date().toISOString(),
      conversationId: resultConversationId,
    };
  };

  const handleRunSingleScenario = async (preset: ScenarioPreset) => {
    setIsRunningScenario(true);
    setRequestError(null);
    try {
      const res = await evaluateScenario(preset);
      setResults((prev) => [res, ...prev.filter((r) => r.presetId !== preset.id)]);
      toast({
        type: 'success',
        title: t('testLab.evaluated', 'Evaluación completada'),
        description: `Escenario "${preset.title}" diagnosticado con éxito.`,
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Ford-service request failed');
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
    setRequestError(null);
    try {
      for (const preset of scenarioPresets) {
        const res = await evaluateScenario(preset);
        newResults.push(res);
      }
      setResults(newResults);
      toast({
        type: 'success',
        title: t('testLab.batchComplete', 'Batería finalizada'),
        description: `${newResults.length} escenarios fueron evaluados.`
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Ford-service request failed');
    } finally {
      setIsRunningAll(false);
    }
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
      setRequestError(null);
      const res = await evaluateScenario(customPreset, conversationId);
      setConversationId(res.conversationId || conversationId);
      localStorage.setItem(sessionStorageKey, res.conversationId || conversationId);
      setResults((prev) => [res, ...prev]);
      setActiveScenarioId(customPreset.id);
      toast({
        type: 'success',
        title: t('testLab.evaluated', 'Evaluación completada'),
        description: 'Diagnóstico generado para tu consulta personalizada.',
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Ford-service request failed');
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
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextId = crypto.randomUUID();
                  setConversationId(nextId);
                  localStorage.setItem(sessionStorageKey, nextId);
                  setRequestError(null);
                }}
                className="rounded-full border-black/[0.04] bg-white shadow-2xs text-xs px-3 py-1 cursor-pointer"
              >
                Nueva sesión
              </Button>

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

        {requestError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            No se completó la llamada a Ford-service: {requestError}
          </div>
        )}
        <p className="text-[11px] text-slate-500">Sesión para consultas personalizadas: {conversationId}</p>
        {tenantIds.length > 1 && (
          <label className="block max-w-sm text-xs text-slate-600">
            Agencia para esta prueba
            <select
              aria-label="Agencia para esta prueba"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">Selecciona una agencia</option>
              {tenantIds.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          </label>
        )}

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

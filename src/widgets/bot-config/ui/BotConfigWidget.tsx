import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Save, RotateCcw } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { OperatingModeSelector } from '../../../features/bot-config/ui/OperatingModeSelector';
import { HandoffRulesSection } from '../../../features/bot-config/ui/HandoffRulesSection';
import { PromptConfigSection } from '../../../features/bot-config/ui/PromptConfigSection';
import { Button, ConfirmDialog, PageHeaderBlock, AtelierCard } from '../../../shared/ui';
import { useToast } from '../../../shared/ui/SonnerToast';

export const BotConfigWidget: React.FC = () => {
  const { t } = useTranslation();
  const { botConfig, updateBotConfig, resetBotConfig } = useCrmStore();
  const { toast } = useToast();

  const [mode, setMode] = useState(botConfig.mode);
  const [keywords, setKeywords] = useState<string>(botConfig.handoffKeywords.join(', '));
  const [handoffOnUnsure, setHandoffOnUnsure] = useState(botConfig.handoffOnUnsure);
  const [prompt, setPrompt] = useState(botConfig.systemPrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const parsedKeywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    setTimeout(() => {
      updateBotConfig({
        mode,
        handoffKeywords: parsedKeywords,
        handoffOnUnsure,
        systemPrompt: prompt,
      });
      setIsSaving(false);
      toast({
        type: 'success',
        title: t('botConfig.saved', 'Guardado'),
        description: t('botConfig.saveSuccessDesc', 'Reglas y parámetros actualizados.'),
      });
    }, 250);
  };

  const handleConfirmReset = () => {
    resetBotConfig();
    const defaultKeywords = 'humano, asesor, persona, agente, hablar con alguien, queja';
    const defaultPrompt = `Eres el Concierge Digital Oficial de Ford Uruapan. Atiendes prospectos en WhatsApp, Instagram y Messenger. Respondes con calidez, elegancia e información técnica precisa.`;

    setMode('auto_reply');
    setKeywords(defaultKeywords);
    setHandoffOnUnsure(true);
    setPrompt(defaultPrompt);
    setIsConfirmResetOpen(false);

    toast({
      type: 'info',
      title: t('botConfig.reset', 'Restablecido'),
      description: t('botConfig.resetSuccessDesc', 'Valores restaurados por defecto.'),
    });
  };

  return (
    <>
      <div id="bot-config-view" className="flex-1 overflow-y-auto bg-[#FBFBFD] p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {/* Header using PageHeaderBlock unit */}
          <PageHeaderBlock
            icon={SlidersHorizontal}
            title={t('botConfig.title', 'Reglas y Tono')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="size-3.5 text-rose-500" />}
                  onClick={() => setIsConfirmResetOpen(true)}
                  className="rounded-full border-black/[0.04] bg-white shadow-2xs text-xs px-3 py-1 cursor-pointer active:scale-95"
                >
                  {t('botConfig.reset', 'Restablecer')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={<Save className="size-3.5" />}
                  onClick={handleSave}
                  className="rounded-full bg-[#0071E3] hover:bg-[#005bb5] shadow-2xs text-xs px-3.5 py-1 cursor-pointer active:scale-95"
                >
                  {isSaving ? t('common.loading', 'Guardando...') : t('botConfig.save', 'Guardar')}
                </Button>
              </>
            }
          />

          {/* Card 1: Operating Mode */}
          <AtelierCard>
            <OperatingModeSelector
              mode={mode}
              onChangeMode={setMode}
            />
          </AtelierCard>

          {/* Card 2: Lead Handoff Triggers */}
          <AtelierCard>
            <HandoffRulesSection
              keywords={keywords}
              onChangeKeywords={setKeywords}
              handoffOnUnsure={handoffOnUnsure}
              onChangeHandoffOnUnsure={setHandoffOnUnsure}
            />
          </AtelierCard>

          {/* Card 3: Dealership Personality & System Prompt */}
          <AtelierCard>
            <PromptConfigSection
              prompt={prompt}
              onChangePrompt={setPrompt}
            />
          </AtelierCard>
        </div>
      </div>

      {/* Explicit Confirmation Dialog for Resetting Rules */}
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        title={t('botConfig.confirmResetTitle', '¿Restablecer configuración?')}
        description={t(
          'botConfig.confirmResetDesc',
          'Esto reemplazará el prompt del sistema y las palabras clave con los valores predeterminados de fábrica de Ford Concierge.'
        )}
        confirmLabel={t('botConfig.resetConfirm', 'Sí, restablecer')}
        cancelLabel={t('common.cancel', 'Cancelar')}
        onConfirm={handleConfirmReset}
        onClose={() => setIsConfirmResetOpen(false)}
        variant="danger"
      />
    </>
  );
};

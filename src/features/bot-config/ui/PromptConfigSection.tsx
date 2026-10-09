import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { AccordionItem } from '../../../shared/ui';

interface PromptConfigSectionProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
}

export const PromptConfigSection: React.FC<PromptConfigSectionProps> = ({
  prompt,
  onChangePrompt,
}) => {
  const { t } = useTranslation();

  return (
    <AccordionItem
      icon={Sparkles}
      iconColor="blue"
      title={t('botConfig.promptTitle')}
      subtitle="Instrucciones del sistema para el asistente IA Concierge"
      isExpanded={true}
    >
      <div className="space-y-2">
        <textarea
          rows={10}
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          className="w-full p-4 font-mono text-xs text-[#1D1D1F] bg-white border border-black/[0.06] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] leading-relaxed transition-all resize-y placeholder:text-[#86868B]"
          placeholder="Instrucciones del sistema para el asistente IA..."
        />
        <span className="text-[11px] text-[#86868B] block">
          Define la personalidad, restricciones de inventario y tono de respuesta para Concierge.
        </span>
      </div>
    </AccordionItem>
  );
};

export default PromptConfigSection;

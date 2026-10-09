import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Lock, Clock, Sparkles, UserCheck } from 'lucide-react';
import { useToast } from '../../../shared/ui/SonnerToast';
import { soundFx } from '../../../shared/lib/sound';
import { Button, AlertBanner } from '../../../shared/ui';

interface OmniComposerProps {
  conversationId: string;
  customerName: string;
  isHumanControlled: boolean;
  isWindowOpen: boolean;
  onSendMessage: (text: string, isInternalNote: boolean) => void;
}

export const OmniComposer: React.FC<OmniComposerProps> = ({
  conversationId,
  customerName,
  isHumanControlled,
  isWindowOpen,
  onSendMessage,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mode, setMode] = useState<'message' | 'note'>('message');
  const [text, setText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('seguimiento_cotizacion');

  const handleSend = () => {
    if (!text.trim()) return;

    const isNote = mode === 'note';
    soundFx.playSend();
    onSendMessage(text, isNote);
    setText('');

    if (isNote) {
      toast({
        type: 'info',
        title: t('composer.internalNoteAdded'),
        description: t('composer.internalNoteAddedDesc'),
      });
    }
  };

  const handleSendTemplate = () => {
    let templateText = '';
    if (selectedTemplate === 'seguimiento_cotizacion') {
      templateText = t('composer.templateQuoteText', { customerName, brand: t('brand.name') });
    } else if (selectedTemplate === 'confirmacion_cita') {
      templateText = t('composer.templateDriveText', { customerName, branch: t('brand.branch') });
    } else {
      templateText = t('composer.templatePromoText', { customerName });
    }

    soundFx.playSend();
    onSendMessage(templateText, false);
    toast({
      type: 'success',
      title: t('composer.hsmSent'),
      description: t('composer.hsmSentDesc'),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-2.5 py-2 sm:p-3 bg-white/95 backdrop-blur-md border-t border-black/[0.05] shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Controls Bar: Compact Segmented Toggle */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="inline-flex items-center bg-[#F5F5F7] p-0.5 rounded-full border border-black/[0.04]">
          <button
            type="button"
            onClick={() => setMode('message')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'message'
                ? 'bg-white text-[#1D1D1F] shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            {isHumanControlled ? (
              <UserCheck className="size-3 text-[#0071E3]" />
            ) : (
              <Sparkles className="size-3 text-[#AF52DE]" />
            )}
            <span>{isHumanControlled ? t('composer.advisorReply') : t('composer.clientMessage')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('note')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'note'
                ? 'bg-[#FF9500] text-white shadow-xs'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Lock className="size-3" />
            <span>{t('composer.internalNote')}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#86868B] select-none">
          <kbd className="px-1.5 py-0.5 rounded bg-[#F5F5F7] text-[9.5px] font-mono text-[#1D1D1F] border border-black/[0.06] shadow-2xs">
            ↵
          </kbd>
          <span>{t('composer.keyboardHint')}</span>
        </div>
      </div>

      {/* Meta 24h Window Block Banner */}
      {!isWindowOpen && mode === 'message' ? (
        <div className="space-y-2">
          <AlertBanner
            type="warning"
            icon={Clock}
            title={`${t('composer.windowClosed')} (SLA Meta 24h)`}
            description="Ventana cerrada. Utiliza una plantilla oficial HSM para retomar contacto."
          />

          <div className="flex items-center gap-1.5">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 text-[11px] p-2 bg-white border border-black/[0.08] rounded-xl text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            >
              <option value="seguimiento_cotizacion">{t('composer.templateQuote')}</option>
              <option value="confirmacion_cita">{t('composer.templateDrive')}</option>
              <option value="actualizacion_inventario">{t('composer.templatePromo')}</option>
            </select>

            <Button
              variant="warning"
              size="xs"
              onClick={handleSendTemplate}
              leftIcon={<Send className="size-3" />}
            >
              {t('composer.sendTemplate')}
            </Button>
          </div>
        </div>
      ) : (
        /* Streamlined High-Density Composer */
        <div
          className={`flex items-end gap-1.5 p-1 rounded-2xl border transition-all ${
            mode === 'note'
              ? 'bg-[#FF9500]/5 border-[#FF9500]/30 focus-within:border-[#FF9500] focus-within:bg-white'
              : 'bg-[#F5F5F7]/80 border-black/[0.06] focus-within:border-[#0071E3] focus-within:bg-white focus-within:shadow-[0_2px_12px_rgba(0,113,227,0.08)]'
          }`}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              mode === 'note'
                ? t('composer.placeholderNote')
                : isHumanControlled
                ? t('composer.placeholderAdvisor')
                : t('composer.placeholderClient')
            }
            className="flex-1 px-3 py-1.5 bg-transparent text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none resize-none max-h-24 min-h-[34px] leading-snug"
          />

          <Button
            variant={mode === 'note' ? 'warning' : 'primary'}
            size="xs"
            disabled={!text.trim()}
            onClick={handleSend}
            leftIcon={<Send className="size-3.5" />}
            className="rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default OmniComposer;

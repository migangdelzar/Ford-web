import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Sparkles, UserCheck, Check } from 'lucide-react';

interface OperatingModeSelectorProps {
  mode: 'auto_reply' | 'suggest_only' | 'off';
  onChangeMode: (mode: 'auto_reply' | 'suggest_only' | 'off') => void;
}

export const OperatingModeSelector: React.FC<OperatingModeSelectorProps> = ({
  mode,
  onChangeMode,
}) => {
  const { t } = useTranslation();

  const modes = [
    {
      id: 'auto_reply' as const,
      label: t('botConfig.autoMode', 'Piloto Automático'),
      badge: 'Autonomía',
      sub: t('botConfig.autoModeSub', 'Respuesta automática en tiempo real'),
      icon: Bot,
      activeColor: '#0071E3',
    },
    {
      id: 'suggest_only' as const,
      label: t('botConfig.copilotMode', 'Copiloto Asistido'),
      badge: 'Sugerencias',
      sub: t('botConfig.copilotModeSub', 'Borradores para revisión del asesor'),
      icon: Sparkles,
      activeColor: '#AF52DE',
    },
    {
      id: 'off' as const,
      label: t('botConfig.manualMode', 'Atención Manual'),
      badge: '100% Humano',
      sub: t('botConfig.manualModeSub', 'Intervención de asesores sin IA'),
      icon: UserCheck,
      activeColor: '#86868B',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-[#0071E3]" />
          <h2 className="text-xs sm:text-sm font-display font-semibold text-[#1D1D1F]">
            {t('botConfig.interventionMode', 'Modo de Intervención')}
          </h2>
        </div>
        <span className="text-[10.5px] font-semibold text-[#86868B]">
          Políticas de Respuesta
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          const Icon = m.icon;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMode(m.id)}
              className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 relative flex flex-col justify-between border cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? 'bg-white border-[#0071E3] shadow-[0_4px_16px_-4px_rgba(0,113,227,0.18)] ring-1 ring-[#0071E3]/30'
                  : 'bg-[#F5F5F7]/70 hover:bg-[#F5F5F7] border-transparent hover:border-black/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-6.5 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#0071E3] text-white shadow-2xs'
                          : 'bg-white text-[#86868B] shadow-2xs'
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-[#1D1D1F]">
                      {m.label}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="size-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="size-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="size-4 rounded-full border border-black/10 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-[#86868B] leading-tight mt-1">
                  {m.sub}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-[#0071E3]' : 'text-[#86868B]'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

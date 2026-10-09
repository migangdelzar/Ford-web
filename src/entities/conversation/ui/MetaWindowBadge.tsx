import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../shared/ui/Badge';

export interface MetaWindowBadgeProps {
  isOpen: boolean;
  onReopen: () => void;
  onSimulateExpire?: () => void;
}

export const MetaWindowBadge: React.FC<MetaWindowBadgeProps> = ({
  isOpen,
  onReopen,
  onSimulateExpire,
}) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onReopen}
        title="Ventana Meta cerrada (>24h). Clic para reabrir con plantilla HSM"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        <span>HSM</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSimulateExpire}
      title="Ventana Meta activa. Clic para simular cierre de ventana (+24h)"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 transition-colors cursor-pointer shrink-0"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span>+24h</span>
    </button>
  );
};

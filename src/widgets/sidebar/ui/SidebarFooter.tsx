import React from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { Authority } from '../../../shared/lib/authority';
import { IconButton } from '../../../shared/ui';

interface SidebarFooterProps {
  isCollapsed: boolean;
  onResetData: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed,
  onResetData,
}) => {
  const { t } = useTranslation();
  const { userRole } = useCrmStore();

  const canReset = Authority.canResetSimulator(userRole);

  return (
    <div className="p-3 border-t border-slate-100">
      {!isCollapsed ? (
        <div className="flex items-center justify-between gap-2 px-1.5 py-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{t('nav.shortcuts', 'Atajos')}</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded text-[10px] font-mono text-slate-600">
              ⌘K
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded text-[10px] font-mono text-slate-600">
              J/K
            </kbd>
          </div>

          {canReset && (
            <button
              id="btn-reset-seeds"
              type="button"
              onClick={onResetData}
              title={t('nav.resetSimulator', 'Restablecer Simulador')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      ) : (
        canReset && (
          <div className="flex justify-center">
            <IconButton
              icon={RotateCcw}
              variant="ghost"
              size="sm"
              onClick={onResetData}
              tooltip={t('nav.resetSimulator', 'Restablecer Simulador')}
            />
          </div>
        )
      )}
    </div>
  );
};

export default SidebarFooter;

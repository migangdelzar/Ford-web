import React from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { Authority } from '../../../shared/lib/authority';
import { Button, IconButton } from '../../../shared/ui';

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
    <div className="p-4 border-t border-black/[0.03] space-y-3">
      {!isCollapsed ? (
        <>
          <div className="flex items-center justify-between text-[10.5px] text-[#86868B] px-1 font-mono">
            <span>{t('nav.shortcuts', 'Atajos')}:</span>
            <div className="flex gap-1.5">
              <kbd className="px-2 py-0.5 bg-white border border-black/[0.06] rounded-md text-[9.5px] text-[#1D1D1F] font-semibold shadow-2xs">
                ⌘K
              </kbd>
              <kbd className="px-2 py-0.5 bg-white border border-black/[0.06] rounded-md text-[9.5px] text-[#1D1D1F] font-semibold shadow-2xs">
                ⌘J
              </kbd>
              <kbd className="px-2 py-0.5 bg-white border border-black/[0.06] rounded-md text-[9.5px] text-[#1D1D1F] font-semibold shadow-2xs">
                ⌘I
              </kbd>
            </div>
          </div>

          {canReset && (
            <Button
              id="btn-reset-seeds"
              variant="danger"
              size="sm"
              fullWidth
              onClick={onResetData}
              leftIcon={<RotateCcw className="size-3.5" />}
            >
              {t('nav.resetSimulator', 'Restablecer Simulador')}
            </Button>
          )}
        </>
      ) : (
        canReset && (
          <IconButton
            icon={RotateCcw}
            variant="danger"
            size="md"
            onClick={onResetData}
            tooltip={t('nav.resetSimulator', 'Restablecer Simulador')}
          />
        )
      )}
    </div>
  );
};

export default SidebarFooter;

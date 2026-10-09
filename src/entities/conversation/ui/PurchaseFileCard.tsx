import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Check, Copy, Shield, ChevronDown } from 'lucide-react';
import { Conversation } from '../../../types';
import { useToast } from '../../../shared/ui/SonnerToast';
import { useCrmStore } from '../../../store/useCrmStore';
import { Authority, DEALERSHIP_TEAM, getVehicleValuationEstimate } from '../../../shared/lib/authority';
import { SectionHeader, DataKeyValue, Button, Badge, Avatar } from '../../../shared/ui';
import { TradeInAndCreditCard } from './TradeInAndCreditCard';

interface PurchaseFileCardProps {
  conversation: Conversation;
  onUpdateFields: (fields: Partial<Conversation['extractedFields']>) => void;
  onAssignAdvisor?: () => void;
}

export const PurchaseFileCard: React.FC<PurchaseFileCardProps> = ({
  conversation,
  onUpdateFields,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userRole, reassignConversation } = useCrmStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState({
    interest: conversation.extractedFields.interest || '',
    budget: conversation.extractedFields.budget || '',
    urgency: conversation.extractedFields.urgency || '',
  });

  const canReassign = Authority.canReassignLead(userRole);
  const canViewFinancials = Authority.canViewExecutiveFinancials(userRole);
  const valuation = getVehicleValuationEstimate(conversation.extractedFields.interest);
  const currentAdvisor = DEALERSHIP_TEAM.find((a) => a.id === conversation.assignedTo) || DEALERSHIP_TEAM[0];

  const handleStartEdit = () => {
    setFields({
      interest: conversation.extractedFields.interest || '',
      budget: conversation.extractedFields.budget || '',
      urgency: conversation.extractedFields.urgency || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateFields(fields);
    setIsEditing(false);
    toast({
      type: 'success',
      title: 'Expediente actualizado',
      description: 'Los datos comerciales han sido guardados.',
    });
  };

  const handleReassign = (advisorId: string) => {
    const target = DEALERSHIP_TEAM.find((a) => a.id === advisorId);
    if (!target) return;
    reassignConversation(conversation.id, target.id, target.name);
    toast({
      type: 'info',
      title: 'Asesor reasignado',
      description: `Prospecto asignado a ${target.name}.`,
    });
  };

  const handleCopyClipboard = () => {
    navigator.clipboard?.writeText(
      `Prospecto: ${conversation.customerName} | Canal: ${conversation.channel} | Unidad: ${conversation.extractedFields.interest || 'N/A'} | Enganche: ${conversation.extractedFields.budget || 'N/A'} | Trade-In: ${conversation.extractedFields.tradeInCar || 'Sin auto'} | Cita: ${conversation.extractedFields.testDriveScheduled || 'Sin cita'} | Asesor: ${currentAdvisor.name}`
    );
    toast({
      type: 'success',
      title: 'Ficha copiada al portapapeles',
      description: 'Resumen completo listo para exportar al CRM o WhatsApp.',
    });
  };

  const editActionButton = isEditing ? (
    <Button variant="success" size="xs" onClick={handleSave} leftIcon={<Check className="size-3" />}>
      {t('prospect.save')}
    </Button>
  ) : (
    <Button variant="ghost" size="xs" onClick={handleStartEdit} leftIcon={<Edit2 className="size-3" />}>
      {t('prospect.modify')}
    </Button>
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title={t('prospect.purchaseFile')}
        action={editActionButton}
      />

      <div className="space-y-3">
        <div>
          <span className="text-[11px] text-[#86868B] font-medium block mb-1">
            {t('prospect.unitInterest')}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={fields.interest}
              onChange={(e) => setFields((prev) => ({ ...prev, interest: e.target.value }))}
              placeholder="Ej: Ford Bronco Sport 2024"
              className="w-full bg-white border border-black/10 rounded-xl px-2.5 py-1.5 text-xs text-[#1D1D1F] font-medium focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3]"
            />
          ) : (
            <DataKeyValue
              label={t('prospect.unitInterest')}
              value={conversation.extractedFields.interest || t('prospect.unspecified')}
              layout="vertical"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/[0.04]">
          {isEditing ? (
            <div>
              <span className="text-[11px] text-[#86868B] font-medium block mb-1">
                {t('prospect.budgetDown')}
              </span>
              <input
                type="text"
                value={fields.budget}
                onChange={(e) => setFields((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="Ej: $150,000 MXN"
                className="w-full bg-white border border-black/10 rounded-xl px-2 py-1 text-xs text-[#1D1D1F] font-mono focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          ) : (
            <DataKeyValue
              label={t('prospect.budgetDown')}
              value={<span className="text-[#248A3D] font-mono">{conversation.extractedFields.budget || t('prospect.toQuote')}</span>}
              layout="vertical"
            />
          )}

          <DataKeyValue
            label={t('prospect.detectedUrgency')}
            value={<span className="capitalize">{conversation.extractedFields.urgency || 'Media'}</span>}
            layout="vertical"
          />
        </div>

        <div className="pt-2 border-t border-black/[0.04]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#86868B] font-medium">
              Asesor Asignado
            </span>
            {canReassign && (
              <span className="text-[10px] text-[#86868B] font-semibold flex items-center gap-1">
                <Shield className="size-3" />
                <span>Supervisor</span>
              </span>
            )}
          </div>

          {canReassign ? (
            <div className="relative">
              <select
                value={conversation.assignedTo || 'adv-01'}
                onChange={(e) => handleReassign(e.target.value)}
                className="w-full appearance-none bg-[#F5F5F7] hover:bg-black/[0.05] border border-black/[0.08] rounded-xl px-2.5 py-1.5 pr-7 text-xs text-[#1D1D1F] font-medium focus:outline-none focus:border-[#0071E3] cursor-pointer transition-colors"
              >
                {DEALERSHIP_TEAM.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} ({advisor.role.split('/')[0].trim()})
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3.5 text-[#86868B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2 py-0.5">
              <Avatar name={currentAdvisor.name} size="xs" shape="circle" />
              <span className="font-medium text-[#1D1D1F] truncate block text-xs">
                {currentAdvisor.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Trade-In Vehicle Valuation & Credit Approval Checklist Component */}
      <TradeInAndCreditCard
        conversation={conversation}
        onUpdateFields={onUpdateFields}
      />

      {canViewFinancials && (
        <div className="p-3.5 bg-[#F5F5F7] border border-black/[0.04] rounded-[20px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-[0.15em]">
              Valuación de Agencia
            </span>
            <Badge variant="primary" size="xs">
              Propietario
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-black/[0.04] text-xs">
            <DataKeyValue
              label="PVP Catálogo"
              value={<span className="font-mono text-[#1D1D1F]">{valuation.price}</span>}
              layout="vertical"
            />
            <DataKeyValue
              label="Margen Estimado"
              value={
                <span className="font-mono text-[#248A3D]">
                  {valuation.margin} <span className="text-[10px] text-[#86868B]">({valuation.marginPct})</span>
                </span>
              }
              layout="vertical"
            />
          </div>
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        fullWidth
        onClick={handleCopyClipboard}
        leftIcon={<Copy className="size-3.5" />}
      >
        Copiar Expediente
      </Button>
    </div>
  );
};

export default PurchaseFileCard;

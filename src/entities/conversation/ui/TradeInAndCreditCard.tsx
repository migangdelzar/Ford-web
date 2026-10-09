import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, CreditCard, Calendar, CheckCircle2, AlertCircle, Edit3, Save } from 'lucide-react';
import { Conversation } from '../../../types';
import { useToast } from '../../../shared/ui/SonnerToast';
import { SectionHeader, DataKeyValue, Button, Badge } from '../../../shared/ui';

interface TradeInAndCreditCardProps {
  conversation: Conversation;
  onUpdateFields: (fields: Partial<Conversation['extractedFields']>) => void;
}

export const TradeInAndCreditCard: React.FC<TradeInAndCreditCardProps> = ({
  conversation,
  onUpdateFields,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [tradeInCar, setTradeInCar] = useState(conversation.extractedFields.tradeInCar || '');
  const [creditPreApproved, setCreditPreApproved] = useState(conversation.extractedFields.creditPreApproved || false);
  const [testDriveScheduled, setTestDriveScheduled] = useState(conversation.extractedFields.testDriveScheduled || '');

  const handleSave = () => {
    onUpdateFields({
      tradeInCar,
      creditPreApproved,
      testDriveScheduled,
    });
    setIsEditing(false);
    toast({
      type: 'success',
      title: 'Ficha del prospecto guardada',
      description: 'Valuación a cuenta y preaprobación de crédito actualizados.',
    });
  };

  return (
    <div className="space-y-3.5 pt-2 border-t border-black/[0.04]">
      <SectionHeader
        title="Seminuevo a Cuenta & Crédito"
        action={
          isEditing ? (
            <Button
              variant="success"
              size="xs"
              onClick={handleSave}
              leftIcon={<Save className="size-3" />}
            >
              Guardar
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="size-3" />}
            >
              Editar
            </Button>
          )
        }
      />

      {/* Trade-In Car Field */}
      <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-black/[0.03] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase font-bold text-[#86868B] tracking-wider flex items-center gap-1.5">
            <Car className="size-3.5 text-[#0071E3]" />
            Auto a Cuenta (Trade-In)
          </span>
          <Badge variant={tradeInCar ? 'info' : 'secondary'} size="xs">
            {tradeInCar ? 'Seminuevo' : 'Sin Auto'}
          </Badge>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={tradeInCar}
            onChange={(e) => setTradeInCar(e.target.value)}
            placeholder="Ej: Mazda 3 2021 (~$185,000 MXN)"
            className="w-full bg-white border border-black/10 rounded-xl px-2.5 py-1.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
          />
        ) : (
          <p className="text-xs font-semibold text-[#1D1D1F] truncate">
            {tradeInCar || 'No se ha registrado auto seminuevo a cuenta'}
          </p>
        )}
      </div>

      {/* Credit Pre-Approval Checklist */}
      <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-black/[0.03] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase font-bold text-[#86868B] tracking-wider flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-[#34C759]" />
            Estatus Crediticio Ford Credit
          </span>
          {isEditing ? (
            <button
              type="button"
              onClick={() => setCreditPreApproved(!creditPreApproved)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                creditPreApproved
                  ? 'bg-[#34C759] text-white'
                  : 'bg-black/10 text-[#1D1D1F]'
              }`}
            >
              {creditPreApproved ? 'Preaprobado' : 'Pendiente'}
            </button>
          ) : (
            <Badge variant={creditPreApproved ? 'success' : 'warning'} size="xs">
              {creditPreApproved ? 'Preaprobado' : 'Sin Analizar'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {creditPreApproved ? (
            <CheckCircle2 className="size-4 text-[#34C759] shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-[#FF9500] shrink-0" />
          )}
          <span className="text-xs text-[#1D1D1F] font-medium">
            {creditPreApproved
              ? 'Buró de crédito favorable. Enganche mínimo 15% autorizado.'
              : 'Requiere envío de comprobantes de ingresos e INE.'}
          </span>
        </div>
      </div>

      {/* Test Drive Scheduling Field */}
      <div className="p-3 bg-[#F5F5F7] rounded-2xl border border-black/[0.03] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase font-bold text-[#86868B] tracking-wider flex items-center gap-1.5">
            <Calendar className="size-3.5 text-[#AF52DE]" />
            Cita de Prueba de Manejo
          </span>
          <Badge variant={testDriveScheduled ? 'purple' : 'secondary'} size="xs">
            {testDriveScheduled ? 'Agendada' : 'Por Definir'}
          </Badge>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={testDriveScheduled}
            onChange={(e) => setTestDriveScheduled(e.target.value)}
            placeholder="Ej: Mañana 11:00 AM en Agencia"
            className="w-full bg-white border border-black/10 rounded-xl px-2.5 py-1.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
          />
        ) : (
          <p className="text-xs font-semibold text-[#1D1D1F] truncate">
            {testDriveScheduled || 'Sin cita agendada en showroom'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TradeInAndCreditCard;

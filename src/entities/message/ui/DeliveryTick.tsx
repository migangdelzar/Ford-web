import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { DeliveryStatus } from '../../../types';

interface DeliveryTickProps {
  status: DeliveryStatus;
  onRetry?: () => void;
}

export const DeliveryTick: React.FC<DeliveryTickProps> = ({ status, onRetry }) => {
  switch (status) {
    case 'sending':
      return (
        <span title="Enviando a Meta...">
          <Clock className="w-3 h-3 text-slate-400 animate-pulse" />
        </span>
      );
    case 'sent':
      return (
        <span title="Enviado a servidores de Meta">
          <Check className="w-3 h-3 text-slate-400" />
        </span>
      );
    case 'delivered':
      return (
        <span title="Entregado al dispositivo del cliente">
          <CheckCheck className="w-3 h-3 text-slate-400" />
        </span>
      );
    case 'read':
      return (
        <span title="Leído por el cliente">
          <CheckCheck className="w-3 h-3 text-blue-500" />
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-medium">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          {onRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="inline-flex items-center gap-0.5 hover:underline focus:outline-none"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reintentar</span>
            </button>
          )}
        </span>
      );
  }
};

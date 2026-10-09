import { readBffCsrfToken } from './operatorAuth';

export interface AiTurnRequest {
  conversationId?: string;
  tenantId?: string;
  containsSensitiveData?: boolean;
  messages: Array<{ role: 'user' | 'customer' | 'assistant' | 'model' | 'system'; content: string }>;
}

export interface AiTurnResponse {
  conversationId: string;
  replyText: string;
  suggestedTemperature: 'UNKNOWN' | 'COLD' | 'WARM' | 'HOT';
  handoffSuggested: boolean;
  handoffReason: string;
  intent: string;
  leadStage: string;
  toolFamily: string;
  sourceDocumentIds: string[];
}

export async function sendAiTurn(request: AiTurnRequest): Promise<AiTurnResponse> {
  const csrf = await readBffCsrfToken();
  const response = await fetch('/api/v1/ai/respond', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(request),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(payload, response.status));
  if (!isAiTurnResponse(payload)) throw new Error('Ford-service returned an invalid AI response');
  return payload;
}

function isAiTurnResponse(value: unknown): value is AiTurnResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<AiTurnResponse>;
  return typeof response.conversationId === 'string'
    && typeof response.replyText === 'string'
    && typeof response.suggestedTemperature === 'string'
    && typeof response.handoffSuggested === 'boolean'
    && Array.isArray(response.sourceDocumentIds);
}

function errorMessage(value: unknown, status: number): string {
  if (value && typeof value === 'object') {
    const detail = (value as { detail?: unknown }).detail;
    const error = (value as { error?: unknown }).error;
    if (typeof detail === 'string' && detail) return detail;
    if (typeof error === 'string' && error) return error;
  }
  return `Ford-service request failed (${status})`;
}

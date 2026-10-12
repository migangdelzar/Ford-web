import { readCsrfToken } from './operatorAuth';

export interface ConversationRecord {
  id: string;
  tenantId: string;
  channel: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM';
  state: 'BOT_ACTIVE' | 'LEAD_CAPTURE' | 'HUMAN_PENDING' | 'HUMAN_ACTIVE' | 'CLOSED';
  version: number;
  participant: { providerId: string; displayName?: string | null; phone?: string | null };
  assignedOperatorId?: string | null;
  leadId?: string | null;
  latestMessage?: ConversationMessageRecord | null;
  updatedAt: string;
}

export interface ConversationMessageRecord {
  id: string;
  conversationId: string;
  providerMessageId?: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  senderType?: 'CUSTOMER' | 'BOT' | 'ADVISOR' | 'SYSTEM';
  sender?: { providerId: string | null; displayName?: string | null; phone?: string | null } | null;
  content: string;
  deliveryStatus?: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | null;
  receivedAt: string;
  sentAt?: string | null;
}

export interface HandoffRecord {
  id: string;
  conversationId: string;
  tenantId?: string;
  status: 'HUMAN_PENDING' | 'HUMAN_ACTIVE' | 'CLOSED';
  version: number;
}

interface Page<T> {
  items: T[];
  page: { pageSize: number; hasNext: boolean; nextCursor?: string | null };
}

export function listConversations(tenantId: string): Promise<Page<ConversationRecord>> {
  const query = new URLSearchParams({ tenantId, pageSize: '50' });
  return getPage(`/api/v1/conversations?${query}`);
}

export async function getConversation(tenantId: string, conversationId: string): Promise<ConversationRecord> {
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/${encodeURIComponent(conversationId)}?${query}`, {
    credentials: 'same-origin', headers: { accept: 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!body || typeof body !== 'object' || typeof (body as { id?: unknown }).id !== 'string'
    || typeof (body as { version?: unknown }).version !== 'number') {
    throw new Error('Ford-service returned an invalid conversation');
  }
  return body as ConversationRecord;
}

export function listConversationMessages(tenantId: string, conversationId: string): Promise<Page<ConversationMessageRecord>> {
  const query = new URLSearchParams({ tenantId, pageSize: '100' });
  return getPage(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages?${query}`);
}

export async function listOpenHandoffs(): Promise<{ items: HandoffRecord[] }> {
  const response = await fetch('/api/v1/handoffs?pageSize=100', {
    credentials: 'same-origin', headers: { accept: 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!body || typeof body !== 'object' || !Array.isArray((body as { items?: unknown }).items)) {
    throw new Error('Ford-service returned an invalid handoff page');
  }
  return body as { items: HandoffRecord[] };
}

export function setConversationTakeover(tenantId: string, conversationId: string): Promise<HandoffRecord> {
  const query = new URLSearchParams({ tenantId });
  return postHandoff(`/api/v1/conversations/${encodeURIComponent(conversationId)}/takeover?${query}`, {});
}

export function setConversationHandback(conversationId: string, expectedVersion: number): Promise<HandoffRecord> {
  const query = new URLSearchParams({ expectedVersion: String(expectedVersion) });
  return postHandoff(`/api/v1/conversations/${encodeURIComponent(conversationId)}/handback?${query}`);
}

export async function sendConversationMessage(
  tenantId: string,
  conversationId: string,
  version: number,
  content: string,
  internalNote = false,
): Promise<{ messageId: string; conversationVersion: number; acceptedAt: string }> {
  const csrf = await readCsrfToken();
  const response = await fetch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages?tenantId=${encodeURIComponent(tenantId)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
      'if-match': `"v${version}"`,
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({ content, internalNote, clientMessageId: crypto.randomUUID() }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!body || typeof body !== 'object'
    || typeof (body as { messageId?: unknown }).messageId !== 'string'
    || typeof (body as { conversationVersion?: unknown }).conversationVersion !== 'number'
    || typeof (body as { acceptedAt?: unknown }).acceptedAt !== 'string') {
    throw new Error('Ford-service returned an invalid message receipt');
  }
  return body as { messageId: string; conversationVersion: number; acceptedAt: string };
}

export interface ConversationMemoryRestartReceipt {
  conversationId: string;
  conversationVersion: number;
  contextStartedAt: string;
}

export interface ConversationRuntimeSettings {
  humanHandoffEnabled: boolean;
  memoryEnabled: boolean;
  promptRecentMessageLimit: number;
}

export interface ConversationRuntimeSettingsSnapshot {
  tenantId: string;
  revision: number;
  settings: ConversationRuntimeSettings;
  updatedAt: string | null;
  updatedBy: string | null;
}

export async function getConversationRuntimeSettings(tenantId: string): Promise<ConversationRuntimeSettingsSnapshot> {
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/runtime-settings?${query}`, {
    credentials: 'same-origin', headers: { accept: 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!isRuntimeSettingsSnapshot(body)) throw new Error('Ford-service returned invalid runtime settings');
  return body;
}

export async function updateConversationRuntimeSettings(
  tenantId: string,
  revision: number,
  settings: ConversationRuntimeSettings,
): Promise<ConversationRuntimeSettingsSnapshot> {
  const csrf = await readCsrfToken();
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/runtime-settings?${query}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json', 'content-type': 'application/json',
      'if-match': `"v${revision}"`, [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(settings),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!isRuntimeSettingsSnapshot(body)) throw new Error('Ford-service returned invalid runtime settings');
  return body;
}

export async function restartConversationContext(
  tenantId: string,
  conversationId: string,
  version: number,
): Promise<ConversationMemoryRestartReceipt> {
  const csrf = await readCsrfToken();
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/restart?${query}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'idempotency-key': crypto.randomUUID(),
      'if-match': `"v${version}"`,
      [csrf.headerName]: csrf.token,
    },
    body: '{}',
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!body || typeof body !== 'object'
    || typeof (body as { conversationId?: unknown }).conversationId !== 'string'
    || typeof (body as { conversationVersion?: unknown }).conversationVersion !== 'number'
    || typeof (body as { contextStartedAt?: unknown }).contextStartedAt !== 'string') {
    throw new Error('Ford-service returned an invalid memory restart receipt');
  }
  return body as ConversationMemoryRestartReceipt;
}

async function getPage<T>(url: string): Promise<Page<T>> {
  const response = await fetch(url, { credentials: 'same-origin', headers: { accept: 'application/json' } });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!isPage(body)) throw new Error('Ford-service returned an invalid page');
  return body as Page<T>;
}

async function postHandoff(url: string, body?: object): Promise<HandoffRecord> {
  const csrf = await readCsrfToken();
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(payload, response.status));
  if (!payload || typeof payload !== 'object'
    || typeof (payload as { id?: unknown }).id !== 'string'
    || typeof (payload as { conversationId?: unknown }).conversationId !== 'string'
    || typeof (payload as { status?: unknown }).status !== 'string'
    || typeof (payload as { version?: unknown }).version !== 'number') {
    throw new Error('Ford-service returned an invalid handoff ticket');
  }
  return payload as HandoffRecord;
}

function isPage(value: unknown): value is Page<unknown> {
  if (!value || typeof value !== 'object') return false;
  const page = value as { items?: unknown; page?: { pageSize?: unknown; hasNext?: unknown } };
  return Array.isArray(page.items)
    && typeof page.page?.pageSize === 'number'
    && typeof page.page?.hasNext === 'boolean';
}

function isRuntimeSettingsSnapshot(value: unknown): value is ConversationRuntimeSettingsSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<ConversationRuntimeSettingsSnapshot>;
  const settings = snapshot.settings;
  return typeof snapshot.tenantId === 'string'
    && typeof snapshot.revision === 'number'
    && !!settings && typeof settings.humanHandoffEnabled === 'boolean'
    && typeof settings.memoryEnabled === 'boolean'
    && typeof settings.promptRecentMessageLimit === 'number';
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

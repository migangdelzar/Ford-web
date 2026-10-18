export interface AfterHoursDigestItem {
  handoffId: string;
  conversationId: string;
  createdAt: string;
  status: 'HUMAN_PENDING' | 'HUMAN_ACTIVE' | 'CLOSED';
  reason: string;
  packetCompleteness: number;
  packetPartial: boolean;
}

export interface AfterHoursDigestRecord {
  tenantId: string;
  businessDate: string;
  timeZone: string;
  available: boolean;
  availableAt: string;
  windowStart: string;
  windowEnd: string;
  totalCount: number;
  completePacketCount: number;
  partialPacketCount: number;
  items: AfterHoursDigestItem[];
}

export async function getAfterHoursDigest(tenantId: string): Promise<AfterHoursDigestRecord> {
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/handoffs/after-hours-digest?${query}`, {
    credentials: 'same-origin', headers: { accept: 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!isAfterHoursDigestRecord(body)) {
    throw new Error('Ford-service returned an invalid after-hours digest');
  }
  return body;
}

function isAfterHoursDigestRecord(value: unknown): value is AfterHoursDigestRecord {
  if (!value || typeof value !== 'object') return false;
  const digest = value as Partial<AfterHoursDigestRecord>;
  return typeof digest.tenantId === 'string'
    && typeof digest.businessDate === 'string'
    && typeof digest.timeZone === 'string'
    && typeof digest.available === 'boolean'
    && typeof digest.availableAt === 'string'
    && typeof digest.windowStart === 'string'
    && typeof digest.windowEnd === 'string'
    && isCount(digest.totalCount)
    && isCount(digest.completePacketCount)
    && isCount(digest.partialPacketCount)
    && Array.isArray(digest.items)
    && digest.items.every(isAfterHoursDigestItem);
}

function isAfterHoursDigestItem(value: unknown): value is AfterHoursDigestItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AfterHoursDigestItem>;
  return typeof item.handoffId === 'string'
    && typeof item.conversationId === 'string'
    && typeof item.createdAt === 'string'
    && (item.status === 'HUMAN_PENDING' || item.status === 'HUMAN_ACTIVE' || item.status === 'CLOSED')
    && typeof item.reason === 'string'
    && isCount(item.packetCompleteness)
    && item.packetCompleteness <= 5
    && typeof item.packetPartial === 'boolean';
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
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

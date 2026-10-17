import { afterEach, describe, expect, it, vi } from 'vitest';
import { readOperatorSession } from '../../../src/shared/api/operatorAuth';

describe('readOperatorSession', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('accepts the server-reported passkey status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      operatorId: 'operator-1',
      displayName: 'Seller',
      email: 'seller@example.com',
      roles: ['OPERATOR'],
      tenantIds: ['tenant-1'],
      hasPasskey: false,
    }), { status: 200, headers: { 'content-type': 'application/json' } })));

    await expect(readOperatorSession()).resolves.toMatchObject({ hasPasskey: false });
  });

  it('rejects a session response without an authoritative passkey status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      operatorId: 'operator-1',
      displayName: 'Seller',
      email: 'seller@example.com',
      roles: ['OPERATOR'],
      tenantIds: ['tenant-1'],
    }), { status: 200, headers: { 'content-type': 'application/json' } })));

    await expect(readOperatorSession()).rejects.toThrow('Operator session response is invalid');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { logoutOperator, readOperatorSession } from '../../src/shared/api/operatorAuth';

const operator = {
  operatorId: '1c190dc6-03fc-4d53-a317-7e7971c3c26e',
  displayName: 'CRM Operator',
  email: 'operator@example.com',
  roles: ['OPERATOR'],
  tenantIds: ['c47f9e67-8252-438a-a1e5-7bc15b63dc33'],
};

describe('Ford-service operator auth API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the operator profile from the same-origin Spring session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(operator));
    vi.stubGlobal('fetch', fetchMock);

    await expect(readOperatorSession()).resolves.toEqual(operator);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ credentials: 'same-origin' }));
  });

  it('treats a missing Spring session as anonymous', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(readOperatorSession()).resolves.toBeNull();
  });

  it('logs out through the CSRF-protected Spring route', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(logoutOperator()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/logout', expect.objectContaining({
      method: 'POST',
      headers: { 'X-XSRF-TOKEN': 'csrf-value' },
    }));
  });
});

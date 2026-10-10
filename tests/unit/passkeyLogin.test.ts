import { describe, expect, it, vi } from 'vitest';
import { authenticateWithPasskey } from '../../src/pages/login/passkeyLogin';

describe('authenticateWithPasskey', () => {
  it('returns to the CRM after Spring establishes the browser session', async () => {
    const credentialBytes = new Uint8Array([1, 2, 3]).buffer;
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ challenge: 'AQ' }))
      .mockResolvedValueOnce(Response.json({ authenticated: true, redirectUrl: '/' }));
    const getCredential = vi.fn(async () => ({
      id: 'credential-id',
      rawId: credentialBytes,
      type: 'public-key',
      response: {
        authenticatorData: credentialBytes,
        clientDataJSON: credentialBytes,
        signature: credentialBytes,
        userHandle: null,
      },
      getClientExtensionResults: () => ({}),
      authenticatorAttachment: 'platform',
    } as unknown as PublicKeyCredential));

    const redirect = await authenticateWithPasskey({
      fetcher,
      csrfReader: async () => ({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }),
      getCredential,
      origin: 'https://ford.emme.business',
    });

    expect(redirect).toBe('/');
    expect(fetcher).toHaveBeenCalledWith('/login/webauthn', expect.any(Object));
  });
});

import { describe, expect, it, vi } from 'vitest';
import { authenticateWithPasskey } from '../../src/pages/login/passkeyLogin';

describe('Ford-web passkey login', () => {
  it('completes Spring WebAuthn login with CSRF and resumes the same-origin OAuth flow', async () => {
    const assertion = {
      id: 'credential-id',
      rawId: Uint8Array.from([1, 2, 3]).buffer,
      type: 'public-key',
      response: {
        authenticatorData: Uint8Array.from([4, 5]).buffer,
        clientDataJSON: Uint8Array.from([6, 7]).buffer,
        signature: Uint8Array.from([8, 9]).buffer,
        userHandle: null,
      },
      authenticatorAttachment: 'platform',
      getClientExtensionResults: () => ({}),
    } as unknown as PublicKeyCredential;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ challenge: 'Y2hhbGxlbmdl', rpId: 'ford.emme.business' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ authenticated: true, redirectUrl: '/oauth2/authorize?client_id=crm' }), { status: 200 }));
    const getCredential = vi.fn(async () => assertion);

    const destination = await authenticateWithPasskey({ fetcher, getCredential, origin: 'https://ford.emme.business', csrfReader: async () => ({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }) });

    expect(destination).toBe('/oauth2/authorize?client_id=crm');
    expect(fetcher).toHaveBeenNthCalledWith(1, '/webauthn/authenticate/options', expect.objectContaining({ method: 'POST' }));
    expect(fetcher).toHaveBeenNthCalledWith(2, '/login/webauthn', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf' }),
    }));
    expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string)).toMatchObject({
      rawId: 'AQID',
      credType: 'public-key',
      response: { authenticatorData: 'BAU', signature: 'CAk' },
    });
  });

  it('rejects a passkey response that tries to navigate away from Ford-web', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ challenge: 'Y2hhbGxlbmdl' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ authenticated: true, redirectUrl: 'https://evil.example/' }), { status: 200 }));
    const getCredential = vi.fn(async () => ({
      id: 'credential-id', rawId: new ArrayBuffer(0), type: 'public-key',
      response: { authenticatorData: new ArrayBuffer(0), clientDataJSON: new ArrayBuffer(0), signature: new ArrayBuffer(0), userHandle: null },
      authenticatorAttachment: null, getClientExtensionResults: () => ({}),
    } as unknown as PublicKeyCredential));

    await expect(authenticateWithPasskey({ fetcher, getCredential, origin: 'https://ford.emme.business', csrfReader: async () => ({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }) }))
      .rejects.toThrow('Authentication returned an invalid redirect');
  });
});

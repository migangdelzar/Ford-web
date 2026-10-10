import { describe, expect, it, vi } from 'vitest';
import { registerPasskey } from '../../src/pages/login/passkeyRegistration';

describe('Ford-web passkey registration', () => {
  it('creates a credential from Spring options and submits the attestation with CSRF', async () => {
    const attestation = {
      attestationObject: Uint8Array.from([4, 5]).buffer,
      clientDataJSON: Uint8Array.from([6, 7]).buffer,
      getTransports: () => ['internal', 'hybrid'],
    } as unknown as AuthenticatorAttestationResponse;
    const credential = {
      id: 'credential-id',
      rawId: Uint8Array.from([1, 2, 3]).buffer,
      type: 'public-key',
      response: attestation,
      authenticatorAttachment: 'platform',
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
    } as unknown as PublicKeyCredential;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({
        challenge: 'Y2hhbGxlbmdl',
        rp: { id: 'ford.emme.business', name: 'Ford Uruapan' },
        user: { id: 'dXNlci1pZA', name: 'miky@example.com', displayName: 'Miky' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        excludeCredentials: [{ type: 'public-key', id: 'ZXhpc3Rpbmc' }],
      }))
      .mockResolvedValueOnce(Response.json({ success: true }));
    const createCredential = vi.fn(async () => credential);

    await expect(registerPasskey({
      fetcher,
      createCredential,
      csrfReader: async () => ({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }),
    })).resolves.toBeUndefined();

    expect(createCredential).toHaveBeenCalledWith(expect.objectContaining({
      challenge: expect.any(ArrayBuffer),
      user: expect.objectContaining({ id: expect.any(ArrayBuffer) }),
      excludeCredentials: [expect.objectContaining({ id: expect.any(ArrayBuffer) })],
    }));
    expect(fetcher).toHaveBeenNthCalledWith(1, '/webauthn/register/options', expect.objectContaining({ method: 'POST' }));
    expect(fetcher).toHaveBeenNthCalledWith(2, '/webauthn/register', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf' }),
    }));
    expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string)).toMatchObject({
      publicKey: {
        credential: {
          rawId: 'AQID',
          response: { attestationObject: 'BAU', clientDataJSON: 'Bgc', transports: ['internal', 'hybrid'] },
        },
        label: 'Ford-web',
      },
    });
  });

  it('stops when browser credential creation is canceled', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({
      challenge: 'Y2hhbGxlbmdl',
      user: { id: 'dXNlci1pZA', name: 'miky@example.com', displayName: 'Miky' },
    }));

    await expect(registerPasskey({
      fetcher,
      createCredential: async () => null,
      csrfReader: async () => ({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }),
    })).rejects.toThrow('No se creó una passkey.');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { proxyFordOriginRequest, shouldRedirectRootToLogin, shouldUseFordWebLogin } from '../../functions/_proxy';

describe('Pages same-origin proxy', () => {
  it('serves GET /login from the Ford-web app while keeping login API routes proxied', () => {
    expect(shouldUseFordWebLogin(new Request('https://crm.example/login'))).toBe(true);
    expect(shouldUseFordWebLogin(new Request('https://crm.example/login', { method: 'POST' }))).toBe(false);
    expect(shouldUseFordWebLogin(new Request('https://crm.example/login/ott?token=opaque'))).toBe(false);
  });

  it('sends root visitors without a BFF session cookie to the single login page', () => {
    expect(shouldRedirectRootToLogin(new Request('https://crm.example/'))).toBe(true);
    expect(shouldRedirectRootToLogin(new Request('https://crm.example/', {
      headers: { cookie: 'ford_session=opaque' },
    }))).toBe(false);
    expect(shouldRedirectRootToLogin(new Request('https://crm.example/login'))).toBe(false);
  });

  it('forwards only approved routes and replaces spoofable forwarding headers', async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } }));
    const request = new Request('https://crm.example/api/v1/leads?cursor=next', {
      headers: {
        cookie: 'ford_session=opaque',
        authorization: 'Bearer browser-token',
        forwarded: 'host=attacker.example',
        'x-forwarded-host': 'attacker.example',
        'x-xsrf-token': 'csrf',
      },
    });
    const response = await proxyFordOriginRequest(request, 'https://origin.internal', fetcher);
    expect(response.status).toBe(200);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toBe('https://origin.internal/api/v1/leads?cursor=next');
    const headers = new Headers(init?.headers);
    expect(headers.get('cookie')).toBe('ford_session=opaque');
    expect(headers.get('x-forwarded-host')).toBe('crm.example');
    expect(headers.get('x-forwarded-proto')).toBe('https');
    expect(headers.has('authorization')).toBe(false);
    expect(headers.has('forwarded')).toBe(false);
  });

  it('rewrites redirects from the internal origin to the public origin', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 302, headers: { location: 'https://origin.internal/login' } }));
    const response = await proxyFordOriginRequest(new Request('https://crm.example/api/auth/login'), 'https://origin.internal', fetcher);
    expect(response.headers.get('location')).toBe('https://crm.example/login');
  });

  it('rejects paths outside the auth and API route families without fetching', async () => {
    const fetcher = vi.fn();
    const response = await proxyFordOriginRequest(new Request('https://crm.example/admin'), 'https://origin.internal', fetcher);
    expect(response.status).toBe(404);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns a bounded configuration error when the origin binding is missing', async () => {
    const response = await proxyFordOriginRequest(new Request('https://crm.example/api/v1/health'), '');
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'origin_configuration_invalid' });
  });
});

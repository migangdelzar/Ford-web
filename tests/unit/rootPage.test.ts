import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/index';

describe('root page auth routing', () => {
  it('redirects visitors without a BFF session to /login', async () => {
    const response = await onRequest({
      request: new Request('https://crm.example/'),
      next: vi.fn(),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://crm.example/login');
  });

  it('serves the CRM app when the session cookie exists', async () => {
    const next = vi.fn(async () => new Response('app'));
    const response = await onRequest({
      request: new Request('https://crm.example/', { headers: { cookie: 'ford_session=opaque' } }),
      next,
    });

    expect(await response.text()).toBe('app');
    expect(next).toHaveBeenCalledOnce();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { createBffProxy } from '../../src/server/bffProxy';

async function withServer(app: express.Express, run: (origin: string) => Promise<void>) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try { await run(origin); }
  finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

describe('same-origin BFF proxy', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('forwards cookies and CSRF headers but drops browser bearer tokens', async () => {
    const browserFetch = globalThis.fetch;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      Response.json({ status: 'ok' }, { headers: { 'set-cookie': 'ford_session=session; HttpOnly' } }));
    const app = express();
    app.use(express.json());
    app.use(createBffProxy('https://bff.internal:3001', fetchMock));

    await withServer(app, async (origin) => {
      const response = await browserFetch(`${origin}/api/v1/ai/respond?debug=false`, {
        method: 'POST',
        headers: {
          cookie: 'ford_session=session; XSRF-TOKEN=csrf',
          'x-xsrf-token': 'csrf',
          authorization: 'Bearer forged',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] }),
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('set-cookie')).toContain('ford_session=session');
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBeDefined();
      expect(init).toBeDefined();
      if (!url || !init) return;
      expect((url as URL).href).toBe('https://bff.internal:3001/api/v1/ai/respond?debug=false');
      expect(init.method).toBe('POST');
      expect(new Headers(init.headers).get('cookie')).toBe('ford_session=session; XSRF-TOKEN=csrf');
      expect(new Headers(init.headers).get('x-xsrf-token')).toBe('csrf');
      expect(new Headers(init.headers).has('authorization')).toBe(false);
      expect(init.body).toBe(JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] }));
    });
  });
});

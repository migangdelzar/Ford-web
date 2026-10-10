import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpFordServiceClient } from '../../src/server/fordServiceClient';

describe('Ford-service internal HTTP client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('allows the named private Compose service over HTTP', async () => {
    const fetchMock = vi.fn(async () => Response.json({ status: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new HttpFordServiceClient({ baseUrl: 'http://ford-service:8080' });

    const response = await client.request('/api/v1/health', '', { method: 'GET' });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://ford-service:8080/api/v1/health'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('still rejects arbitrary insecure service hosts', () => {
    expect(() => new HttpFordServiceClient({ baseUrl: 'http://example.com' })).toThrow();
  });
});

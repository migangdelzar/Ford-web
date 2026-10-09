import { Readable } from 'node:stream';
import type { RequestHandler } from 'express';

export function createBffProxy(baseUrl: string, fetcher: typeof fetch = fetch): RequestHandler {
  const origin = new URL(baseUrl);
  if (origin.protocol !== 'https:' && origin.hostname !== 'localhost' && origin.hostname !== '127.0.0.1') {
    throw new Error('Ford BFF URL must use HTTPS outside local development');
  }

  return async (request, response) => {
    const target = new URL(request.originalUrl, origin);
    if (target.origin !== origin.origin || !target.pathname.startsWith('/api/')) {
      return response.status(404).json({ error: 'backend_route_unavailable' });
    }
    const headers = new Headers();
    for (const name of ['accept', 'content-type', 'cookie', 'x-xsrf-token']) {
      const value = request.get(name);
      if (value) headers.set(name, value);
    }
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = request.is('application/x-www-form-urlencoded')
        ? new URLSearchParams(request.body as Record<string, string>).toString()
        : JSON.stringify(request.body ?? {});
    }
    try {
      const isEventStream = target.pathname === '/api/v1/operator/events/stream'
        || target.pathname === '/api/v1/events/stream';
      const upstream = await fetcher(target, {
        method: request.method,
        headers,
        ...(body === undefined ? {} : { body }),
        ...(isEventStream ? {} : { signal: AbortSignal.timeout(30_000) }),
      });
      response.status(upstream.status);
      response.setHeader('Cache-Control', 'no-store');
      const contentType = upstream.headers.get('content-type');
      if (contentType) response.setHeader('Content-Type', contentType);
      for (const cookie of upstream.headers.getSetCookie?.() ?? []) {
        response.append('Set-Cookie', cookie);
      }
      if (contentType?.startsWith('text/event-stream') && upstream.body) {
        response.setHeader('Cache-Control', 'no-cache, no-transform');
        response.setHeader('X-Accel-Buffering', 'no');
        Readable.fromWeb(upstream.body as unknown as import('node:stream/web').ReadableStream).pipe(response);
        return;
      }
      return response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      return response.status(502).json({ error: 'ford_bff_unavailable' });
    }
  };
}

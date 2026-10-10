import { Readable } from 'node:stream';
import type { Request, RequestHandler } from 'express';

const FORWARDED_HEADERS = [
  'accept', 'content-type', 'cookie', 'origin', 'referer', 'x-xsrf-token', 'if-match', 'idempotency-key', 'last-event-id',
];
const ALLOWED_PREFIXES = ['/api/auth', '/api/v1', '/webauthn', '/login/ott', '/login/webauthn'];

export function createFordServiceProxy(baseUrl: string, fetcher: typeof fetch = fetch): RequestHandler {
  const origin = new URL(baseUrl);
  const localService = ['localhost', '127.0.0.1', 'ford-service'].includes(origin.hostname);
  if ((origin.protocol !== 'https:' && !(origin.protocol === 'http:' && localService))
    || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Ford-service URL must use HTTPS outside local development');
  }

  return async (request, response) => {
    const target = new URL(request.originalUrl, origin);
    if (target.origin !== origin.origin || !isAllowedPath(target.pathname, request.method)) {
      return response.status(404).json({ error: 'route_not_found' });
    }

    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
      const value = request.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('x-forwarded-host', request.get('host') ?? 'localhost');
    headers.set('x-forwarded-proto', request.protocol);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody
      ? request.is('application/x-www-form-urlencoded')
        ? new URLSearchParams(request.body as Record<string, string>).toString()
        : JSON.stringify(request.body ?? {})
      : undefined;
    try {
      const isEventStream = target.pathname === '/api/v1/operator/events/stream'
        || target.pathname === '/api/v1/events/stream';
      const upstream = await fetcher(target, {
        method: request.method,
        headers,
        ...(body === undefined ? {} : { body }),
        ...(isEventStream ? {} : { signal: AbortSignal.timeout(30_000) }),
        redirect: 'manual',
      });
      response.status(upstream.status);
      response.setHeader('Cache-Control', 'no-store');
      const contentType = upstream.headers.get('content-type');
      if (contentType) response.setHeader('Content-Type', contentType);
      for (const cookie of upstream.headers.getSetCookie?.() ?? []) response.append('Set-Cookie', cookie);
      const location = upstream.headers.get('location');
      if (location) response.setHeader('Location', rewriteRedirect(location, origin, request));
      if (contentType?.startsWith('text/event-stream') && upstream.body) {
        response.setHeader('Cache-Control', 'no-cache, no-transform');
        response.setHeader('X-Accel-Buffering', 'no');
        Readable.fromWeb(upstream.body as unknown as import('node:stream/web').ReadableStream).pipe(response);
        return;
      }
      return response.end(Buffer.from(await upstream.arrayBuffer()));
    } catch {
      return response.status(502).json({ error: 'ford_service_unavailable' });
    }
  };
}

function isAllowedPath(pathname: string, method: string): boolean {
  if (pathname === '/login') return method === 'POST';
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function rewriteRedirect(location: string, origin: URL, request: Request): string {
  try {
    const target = new URL(location, origin);
    if (target.origin !== origin.origin) return location;
    return `${request.protocol}://${request.get('host')}${target.pathname}${target.search}${target.hash}`;
  } catch {
    return location;
  }
}

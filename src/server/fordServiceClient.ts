import type { FordServiceClient } from './auth/types';

export interface FordServiceClientOptions {
  baseUrl: string;
  timeoutMs?: number;
}

export class HttpFordServiceClient implements FordServiceClient {
  private readonly origin: URL;
  private readonly timeoutMs: number;

  constructor(options: FordServiceClientOptions) {
    this.origin = new URL(options.baseUrl);
    if (this.origin.protocol !== 'https:' && this.origin.hostname !== 'localhost' && this.origin.hostname !== '127.0.0.1') {
      throw new Error('Ford-service URL must use HTTPS outside local development');
    }
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  request(path: string, accessToken: string, init: RequestInit): Promise<Response> {
    const allowedAuthPaths = new Set(['/api/auth/csrf', '/api/auth/one-time-token', '/logout']);
    if ((!path.startsWith('/api/v1/') && !allowedAuthPaths.has(path.split('?')[0])) || path.startsWith('//')) {
      throw new Error('Only approved Ford-service API paths may be forwarded');
    }
    const target = new URL(path, this.origin);
    if (target.origin !== this.origin.origin) throw new Error('Ford-service target origin changed');
    const headers = new Headers(init.headers);
    if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
    const isEventStream = target.pathname === '/api/v1/operator/events/stream'
      || target.pathname === '/api/v1/events/stream';
    return fetch(target, {
      ...init,
      headers,
      ...(isEventStream ? {} : { signal: AbortSignal.timeout(this.timeoutMs) }),
    });
  }
}

import { timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import express, { type Express, type Request, type Response } from 'express';
import type { CreateBffAppOptions, StoredBffSession } from './types';

const ACCESS_TOKEN_REFRESH_WINDOW_MS = 30_000;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const IMPLEMENTED_API_ROUTES: ReadonlyArray<[string, RegExp]> = [
  ['GET', /^\/api\/v1\/(?:health|operator\/me|operator\/events\/stream|conversations|handoffs|metrics\/(?:overview|bot|leads|conversations|channels|advisors|funnel|timeseries)|leads|inventory|team\/advisors|bot\/config|events(?:\/stream)?|test-lab\/faults|branches\/on-duty|appointments\/available-slots)$/],
  ['GET', /^\/api\/v1\/(?:conversations|leads|handoffs)\/[0-9a-f-]{36}(?:\/(?:messages|window))?$/i],
  ['GET', /^\/api\/v1\/vehicles\/[a-z0-9-]{1,32}$/i],
  ['POST', /^\/api\/v1\/(?:ai\/respond|conversations\/[0-9a-f-]{36}\/(?:messages|takeover|handback)|handoffs(?:\/[0-9a-f-]{36}\/(?:claim|pause|resume))?|leads\/[0-9a-f-]{36}\/sync|finance\/quote|appointments\/book|conversations\/[0-9a-f-]{36}\/hsm)$/i],
  ['PATCH', /^\/api\/v1\/leads\/[0-9a-f-]{36}$/i],
  ['PUT', /^\/api\/v1\/(?:bot\/config|test-lab\/faults|operator\/ai\/system-prompt)$/],
  ['GET', /^\/api\/v1\/operator\/ai\/system-prompt$/],
];

export function createBffApp({ auth, sessions, service, config }: CreateBffAppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Pragma', 'no-cache');
    next();
  });

  app.get('/healthz', (_request, response) => response.status(200).json({ status: 'ok' }));

  app.get('/api/auth/login', async (_request, response) => {
    try {
      const request = await auth.createAuthorizationRequest();
      await sessions.saveLoginTransaction(request.state, request.transaction);
      return response.redirect(302, request.authorizationUrl);
    } catch {
      return response.status(503).json({ error: 'authentication_unavailable' });
    }
  });

  app.get('/api/auth/callback', async (request, response) => {
    const state = typeof request.query.state === 'string' ? request.query.state : '';
    if (!state || typeof request.query.code !== 'string') {
      return response.status(400).json({ error: 'invalid_authorization_response' });
    }
    const transaction = await sessions.consumeLoginTransaction(state);
    if (!transaction || transaction.state !== state || Date.now() - transaction.createdAt > 5 * 60_000) {
      return response.status(400).json({ error: 'invalid_authorization_state' });
    }
    try {
      const callbackUrl = new URL(request.originalUrl, config.publicOrigin);
      const tokens = await auth.completeAuthorization(callbackUrl, transaction);
      const profileResponse = await service.request('/api/v1/operator/me', tokens.accessToken, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (!profileResponse.ok) return response.status(401).json({ error: 'operator_profile_unavailable' });
      const profile = await profileResponse.json();
      if (!isOperatorProfile(profile)) return response.status(502).json({ error: 'invalid_operator_profile' });
      const sessionId = await sessions.createSession({ ...tokens, profile });
      response.setHeader('Set-Cookie', cookie(config.sessionCookieName, sessionId, config.cookieSecure, true, '/api'));
      return response.redirect(302, '/');
    } catch {
      return response.status(401).json({ error: 'authorization_failed' });
    }
  });

  app.get('/api/auth/csrf', async (request, response) => {
    return forward(service, request, response, '/api/auth/csrf', '');
  });

  app.post('/api/auth/one-time-token', async (request, response) => {
    if (!validCsrf(request, config.csrfCookieName)) {
      return response.status(403).json({ error: 'csrf_validation_failed' });
    }
    return forward(service, request, response, '/api/auth/one-time-token', '');
  });

  app.get('/api/auth/me', async (request, response) => {
    const current = await activeSession(request, response, config, sessions, auth);
    if (!current) return response.status(401).json({ error: 'session_unauthorized' });
    return response.status(200).json(current.session.profile);
  });

  app.post('/api/auth/logout', async (request, response) => {
    if (!validCsrf(request, config.csrfCookieName)) {
      return response.status(403).json({ error: 'csrf_validation_failed' });
    }
    const current = await activeSession(request, response, config, sessions, auth);
    const springCookies = (request.get('cookie') ?? '').split(';')
      .map((value) => value.trim())
      .filter((value) => /^(SESSION|JSESSIONID|XSRF-TOKEN)=/.test(value));
    const headers: Record<string, string> = {};
    const csrf = request.get('x-xsrf-token');
    if (csrf) headers['x-xsrf-token'] = csrf;
    if (springCookies.length > 0) headers.cookie = springCookies.join('; ');
    let springLogout: globalThis.Response | null = null;
    try {
      springLogout = await service.request('/logout', '', { method: 'POST', headers });
    } catch {
      // Always remove the BFF session below; report Spring logout failure to the UI.
    }
    if (current) await sessions.deleteSession(current.id);
    const cookies = springLogout?.headers.getSetCookie?.() ?? [];
    response.setHeader('Set-Cookie', [...cookies,
      clearCookie(config.sessionCookieName, config.cookieSecure, true, '/api'),
    ]);
    if (!springLogout?.ok) return response.status(502).json({ error: 'spring_logout_unavailable' });
    return response.status(204).end();
  });

  app.use('/api/v1', async (request, response) => {
    const path = request.originalUrl.split('?')[0];
    if (!IMPLEMENTED_API_ROUTES.some(([method, route]) => method === request.method && route.test(path))) {
      return response.status(404).json({ error: 'backend_route_unavailable' });
    }
    if (path === '/api/v1/health') {
      return forward(service, request, response, path, '');
    }
    const current = await activeSession(request, response, config, sessions, auth);
    if (!current) return response.status(401).json({ error: 'session_unauthorized' });
    if (!SAFE_METHODS.has(request.method) && !validCsrf(request, config.csrfCookieName)) {
      return response.status(403).json({ error: 'csrf_validation_failed' });
    }
    return forward(service, request, response, path, current.session.accessToken);
  });

  return app;
}

async function activeSession(
  request: Request,
  response: Response,
  config: CreateBffAppOptions['config'],
  sessions: CreateBffAppOptions['sessions'],
  auth: CreateBffAppOptions['auth'],
): Promise<{ id: string; session: StoredBffSession } | null> {
  const id = readCookie(request, config.sessionCookieName);
  if (!id) return null;
  const session = await sessions.getSession(id);
  if (!session) return null;
  if (session.expiresAt > Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS) return { id, session };
  try {
    const refreshed = await auth.refresh(session);
    if (!(await sessions.updateSession(id, refreshed))) return null;
    return { id, session: refreshed };
  } catch {
    await sessions.deleteSession(id);
    response.setHeader('Set-Cookie', clearCookie(config.sessionCookieName, config.cookieSecure, true, '/api'));
    return null;
  }
}

async function forward(
  service: CreateBffAppOptions['service'],
  request: Request,
  response: Response,
  path: string,
  accessToken: string,
) {
  const query = new URL(request.originalUrl, 'http://bff.local').search;
  const headers: Record<string, string> = {};
  for (const name of ['accept', 'content-type', 'if-match', 'x-xsrf-token']) {
    const value = request.get(name);
    if (value) headers[name] = value;
  }
  const springCookies = (request.get('cookie') ?? '').split(';')
    .map((value) => value.trim())
    .filter((value) => /^(SESSION|JSESSIONID|XSRF-TOKEN)=/.test(value));
  if (springCookies.length > 0) headers.cookie = springCookies.join('; ');
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = request.is('application/x-www-form-urlencoded')
      ? new URLSearchParams(request.body as Record<string, string>).toString()
      : JSON.stringify(request.body ?? {});
  }
  let upstream: globalThis.Response;
  try {
    upstream = await service.request(`${path}${query}`, accessToken, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
    });
  } catch {
    return response.status(502).json({ error: 'ford_service_unavailable' });
  }
  response.status(upstream.status);
  const contentType = upstream.headers.get('content-type');
  if (contentType) response.setHeader('Content-Type', contentType);
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) response.setHeader('Cache-Control', cacheControl);
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) response.setHeader('Set-Cookie', setCookies);
    if (contentType?.startsWith('text/event-stream')) {
    if (!upstream.body) return response.end();
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('X-Accel-Buffering', 'no');
    Readable.fromWeb(upstream.body as unknown as import('node:stream/web').ReadableStream).pipe(response);
    return;
  }
  const upstreamBody = await upstream.arrayBuffer();
  return response.end(Buffer.from(upstreamBody));
}

function validCsrf(request: Request, cookieName: string): boolean {
  const cookieToken = readCookie(request, cookieName);
  const headerToken = request.get('x-xsrf-token');
  const formToken = request.is('application/x-www-form-urlencoded')
    && request.body && typeof request.body._csrf === 'string'
    ? request.body._csrf
    : undefined;
  const submittedToken = headerToken ?? formToken;
  if (!cookieToken || !submittedToken) return false;
  const left = Buffer.from(cookieToken);
  const right = Buffer.from(submittedToken);
  return left.length === right.length && timingSafeEqual(left, right);
}

function readCookie(request: Request, name: string): string | null {
  const prefix = `${name}=`;
  for (const item of (request.get('cookie') ?? '').split(';')) {
    const value = item.trim();
    if (value.startsWith(prefix)) return decodeURIComponent(value.slice(prefix.length));
  }
  return null;
}

function cookie(name: string, value: string, secure: boolean, httpOnly: boolean, path: string): string {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=28800; SameSite=Lax${secure ? '; Secure' : ''}${httpOnly ? '; HttpOnly' : ''}`;
}

function clearCookie(name: string, secure: boolean, httpOnly: boolean, path: string): string {
  return `${name}=; Path=${path}; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}${httpOnly ? '; HttpOnly' : ''}`;
}

function isOperatorProfile(value: unknown): value is StoredBffSession['profile'] {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<StoredBffSession['profile']>;
  return typeof profile.operatorId === 'string'
    && typeof profile.displayName === 'string'
    && typeof profile.email === 'string'
    && Array.isArray(profile.roles)
    && Array.isArray(profile.tenantIds);
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';
import { createBffApp } from '../../src/server/auth/createBffApp';
import type {
  BffAuthProvider,
  BffSessionStore,
  FordServiceClient,
  LoginTransaction,
  OperatorSession,
  StoredBffSession,
} from '../../src/server/auth/types';

const operator: OperatorSession = {
  operatorId: '1c190dc6-03fc-4d53-a317-7e7971c3c26e',
  displayName: 'CRM Operator',
  email: 'operator@example.com',
  roles: ['OPERATOR'],
  tenantIds: ['c47f9e67-8252-438a-a1e5-7bc15b63dc33'],
};

class MemorySessionStore implements BffSessionStore {
  readonly transactions = new Map<string, LoginTransaction>();
  readonly sessions = new Map<string, StoredBffSession>();

  async saveLoginTransaction(state: string, transaction: LoginTransaction) {
    this.transactions.set(state, transaction);
  }

  async consumeLoginTransaction(state: string) {
    const transaction = this.transactions.get(state) ?? null;
    this.transactions.delete(state);
    return transaction;
  }

  async createSession(session: StoredBffSession) {
    const id = `opaque-${this.sessions.size + 1}`;
    this.sessions.set(id, session);
    return id;
  }

  async getSession(id: string) {
    return this.sessions.get(id) ?? null;
  }

  async updateSession(id: string, session: StoredBffSession) {
    if (!this.sessions.has(id)) return false;
    this.sessions.set(id, session);
    return true;
  }

  async deleteSession(id: string) {
    this.sessions.delete(id);
  }
}

async function withServer(app: Express, run: (origin: string) => Promise<void>) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await run(origin);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function fixture() {
  const sessions = new MemorySessionStore();
  const auth: BffAuthProvider = {
    createAuthorizationRequest: vi.fn(async () => ({
      authorizationUrl: 'https://ford.emme.business/oauth2/authorize?state=valid-state',
      state: 'valid-state',
      transaction: { state: 'valid-state', nonce: 'nonce', codeVerifier: 'verifier', createdAt: Date.now() },
    })),
    completeAuthorization: vi.fn(async () => ({
      accessToken: 'access-token-private',
      refreshToken: 'refresh-token-private',
      expiresAt: Date.now() + 60_000,
    })),
    refresh: vi.fn(async (session) => session),
  };
  const service: FordServiceClient = {
    request: vi.fn(async (path) => path.startsWith('/api/v1/operator/me')
      ? Response.json(operator)
      : path === '/api/auth/csrf'
        ? Response.json({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' }, {
            headers: { 'set-cookie': 'XSRF-TOKEN=csrf-value; Path=/; SameSite=Lax' },
          })
      : path === '/api/auth/one-time-token'
          ? Response.json({ accepted: true }, { status: 202 })
          : path === '/logout'
            ? new Response(null, { status: 204, headers: { 'set-cookie': 'SESSION=; Path=/; Max-Age=0' } })
          : Response.json({ replyText: 'Grounded response', conversationId: 'conversation-1' })),
  };
  const app = createBffApp({
    auth,
    sessions,
    service,
    config: {
      publicOrigin: 'https://ford.emme.business',
      fordServiceUrl: 'http://ford-service.internal',
      sessionCookieName: 'ford_session',
      csrfCookieName: 'XSRF-TOKEN',
      cookieSecure: true,
    },
  });
  return { app, auth, sessions, service };
}

describe('Ford-web BFF authentication', () => {
  afterEach(() => vi.restoreAllMocks());

  it('starts authorization code login without returning token data', async () => {
    const { app, sessions, service } = fixture();
    await withServer(app, async (origin) => {
      const response = await fetch(`${origin}/api/auth/login`, { redirect: 'manual' });
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('https://ford.emme.business/oauth2/authorize?state=valid-state');
      expect(sessions.transactions.has('valid-state')).toBe(true);
      expect(await response.text()).not.toContain('access-token-private');
    });
  });

  it('rejects callback state mismatch and consumes a valid state only once', async () => {
    const { app, auth, sessions } = fixture();
    await sessions.saveLoginTransaction('valid-state', {
      state: 'valid-state', nonce: 'nonce', codeVerifier: 'verifier', createdAt: Date.now(),
    });
    await withServer(app, async (origin) => {
      const rejected = await fetch(`${origin}/api/auth/callback?code=code&state=other`, { redirect: 'manual' });
      expect(rejected.status).toBe(400);
      expect(auth.completeAuthorization).not.toHaveBeenCalled();

      const accepted = await fetch(`${origin}/api/auth/callback?code=code&state=valid-state`, { redirect: 'manual' });
      expect(accepted.status).toBe(302);
      expect(accepted.headers.get('location')).toBe('/');
      expect(accepted.headers.get('set-cookie')).toContain('ford_session=opaque-1');
      expect(accepted.headers.getSetCookie()).toEqual(expect.arrayContaining([
        expect.stringContaining('Path=/;'),
        expect.stringContaining('ford_session=; Path=/api; Max-Age=0'),
      ]));
      expect(accepted.headers.get('set-cookie')).toContain('HttpOnly');
      expect(accepted.headers.get('set-cookie')).toContain('Secure');
      expect(await accepted.text()).not.toContain('access-token-private');
      expect(sessions.transactions.has('valid-state')).toBe(false);
    });
  });

  it('returns current operator only for an active BFF session', async () => {
    const { app, sessions } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    await withServer(app, async (origin) => {
      expect((await fetch(`${origin}/api/auth/me`)).status).toBe(401);
      const response = await fetch(`${origin}/api/auth/me`, { headers: { cookie: `ford_session=${sessionId}` } });
      expect(response.status).toBe(200);
      expect(response.headers.getSetCookie()).toEqual(expect.arrayContaining([
        expect.stringContaining('ford_session=; Path=/api; Max-Age=0'),
        expect.stringContaining('ford_session=opaque-1; Path=/;'),
      ]));
      expect(await response.json()).toEqual(operator);
      expect(response.headers.get('cache-control')).toContain('no-store');
    });
  });

  it('requires CSRF on logout and destroys the server-side session', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    await withServer(app, async (origin) => {
      const denied = await fetch(`${origin}/api/auth/logout`, {
        method: 'POST', headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(denied.status).toBe(403);
      const accepted = await fetch(`${origin}/api/auth/logout`, {
        method: 'POST',
        headers: { cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`, 'x-xsrf-token': 'csrf-value' },
      });
      expect(accepted.status).toBe(204);
      expect(sessions.sessions.has(sessionId)).toBe(false);
      expect(accepted.headers.get('set-cookie')).toContain('ford_session=');
      expect(accepted.headers.get('set-cookie')).toContain('Path=/;');
      expect(accepted.headers.get('set-cookie')).toContain('SESSION=;');
      expect(service.request).toHaveBeenCalledWith('/logout', '', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          cookie: 'XSRF-TOKEN=csrf-value',
          'x-xsrf-token': 'csrf-value',
        }),
      }));
    });
  });

  it('forwards authenticated API requests and never accepts a browser bearer token', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    await withServer(app, async (origin) => {
      const denied = await fetch(`${origin}/api/v1/ai/respond`, {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer forged' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
      });
      expect(denied.status).toBe(401);

      const accepted = await fetch(`${origin}/api/v1/ai/respond`, {
        method: 'POST', headers: {
          cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`,
          'x-xsrf-token': 'csrf-value',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
      });
      expect(accepted.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(
        '/api/v1/ai/respond', 'private-access', expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('forwards documented conversation reads and rejects undocumented routes', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    await withServer(app, async (origin) => {
      const conversations = await fetch(`${origin}/api/v1/conversations?tenantId=${operator.tenantIds[0]}`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(conversations.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(
        `/api/v1/conversations?tenantId=${operator.tenantIds[0]}`,
        'private-access', expect.objectContaining({ method: 'GET' }),
      );

      const unsupported = await fetch(`${origin}/api/v1/unpublished-admin-route`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(unsupported.status).toBe(404);
    });
  });

  it('forwards shadow-draft review only through an authenticated session with CSRF', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    const conversationId = '22111111-1111-1111-1111-111111111111';
    const draftId = '33111111-1111-1111-1111-111111111111';
    const tenantId = operator.tenantIds[0];
    const listPath = `/api/v1/conversations/${conversationId}/shadow-drafts?tenantId=${tenantId}`;
    const reviewPath = `/api/v1/conversations/${conversationId}/shadow-drafts/${draftId}/review?tenantId=${tenantId}`;

    await withServer(app, async (origin) => {
      const unauthenticated = await fetch(`${origin}${listPath}`);
      expect(unauthenticated.status).toBe(401);

      const list = await fetch(`${origin}${listPath}`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(list.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(listPath, 'private-access', expect.objectContaining({ method: 'GET' }));

      vi.mocked(service.request).mockClear();
      const rejectedReview = await fetch(`${origin}${reviewPath}`, {
        method: 'POST',
        headers: { cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`, 'content-type': 'application/json' },
        body: JSON.stringify({ decision: 'REJECTED', note: 'needs review' }),
      });
      expect(rejectedReview.status).toBe(403);
      expect(service.request).not.toHaveBeenCalled();

      const acceptedReview = await fetch(`${origin}${reviewPath}`, {
        method: 'POST',
        headers: {
          cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`,
          'x-xsrf-token': 'csrf-value',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ decision: 'REJECTED', note: 'needs review' }),
      });
      expect(acceptedReview.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(reviewPath, 'private-access', expect.objectContaining({
        method: 'POST', body: JSON.stringify({ decision: 'REJECTED', note: 'needs review' }),
      }));

      vi.mocked(service.request).mockClear();
      const unsupportedSend = await fetch(
        `${origin}/api/v1/conversations/${conversationId}/shadow-drafts/${draftId}/send?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: {
            cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`,
            'x-xsrf-token': 'csrf-value',
            'content-type': 'application/json',
          },
          body: '{}',
        },
      );
      expect(unsupportedSend.status).toBe(404);
      expect(service.request).not.toHaveBeenCalled();
    });
  });

  it('forwards approved conversation restart and runtime settings routes with operator access token', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    const conversationId = '9a1e2cd0-2df2-4eeb-a9c0-327f8a3de422';
    await withServer(app, async (origin) => {
      const restart = await fetch(`${origin}/api/v1/conversations/${conversationId}/restart?tenantId=${operator.tenantIds[0]}`, {
        method: 'POST',
        headers: {
          cookie: `ford_session=${sessionId}; XSRF-TOKEN=csrf-value`,
          'x-xsrf-token': 'csrf-value',
          'if-match': '"v7"',
          'idempotency-key': 'restart-1',
          'content-type': 'application/json',
        },
        body: '{}',
      });
      expect(restart.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(
        `/api/v1/conversations/${conversationId}/restart?tenantId=${operator.tenantIds[0]}`,
        'private-access', expect.objectContaining({ method: 'POST' }),
      );

      const settings = await fetch(`${origin}/api/v1/conversations/runtime-settings?tenantId=${operator.tenantIds[0]}`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(settings.status).toBe(200);
      expect(service.request).toHaveBeenCalledWith(
        `/api/v1/conversations/runtime-settings?tenantId=${operator.tenantIds[0]}`,
        'private-access', expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  it('streams operator events through the authenticated same-origin BFF session', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    vi.mocked(service.request).mockResolvedValueOnce(new Response('event: connected\ndata: {}\n\n', {
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
    }));
    await withServer(app, async (origin) => {
      const response = await fetch(`${origin}/api/v1/operator/events/stream?tenantId=${operator.tenantIds[0]}`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(response.headers.get('content-type')).toContain('text/event-stream');
      expect(await response.text()).toContain('event: connected');
      expect(service.request).toHaveBeenCalledWith(
        `/api/v1/operator/events/stream?tenantId=${operator.tenantIds[0]}`,
        'private-access',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  it('returns a bounded service error when Ford-service is unreachable', async () => {
    const { app, sessions, service } = fixture();
    const sessionId = await sessions.createSession({
      accessToken: 'private-access', refreshToken: 'private-refresh', expiresAt: Date.now() + 60_000, profile: operator,
    });
    vi.mocked(service.request).mockRejectedValueOnce(new Error('network failure'));
    await withServer(app, async (origin) => {
      const response = await fetch(`${origin}/api/v1/operator/me`, {
        headers: { cookie: `ford_session=${sessionId}` },
      });
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ error: 'ford_service_unavailable' });
    });
  });

  it('relays Spring CSRF state and permits an enumeration-neutral OTP request', async () => {
    const { app, service } = fixture();
    await withServer(app, async (origin) => {
      const csrf = await fetch(`${origin}/api/auth/csrf`);
      expect(csrf.status).toBe(200);
      expect(csrf.headers.get('set-cookie')).toContain('XSRF-TOKEN=csrf-value');
      const otp = await fetch(`${origin}/api/auth/one-time-token`, {
        method: 'POST',
        headers: {
          cookie: 'XSRF-TOKEN=csrf-value; SESSION=spring-session',
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: 'username=operator%40example.com&_csrf=csrf-value',
      });
      expect(otp.status).toBe(202);
      expect(await otp.json()).toEqual({ accepted: true });
      expect(service.request).toHaveBeenCalledWith('/api/auth/one-time-token', '', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          cookie: 'XSRF-TOKEN=csrf-value; SESSION=spring-session',
        }),
        body: 'username=operator%40example.com&_csrf=csrf-value',
      }));
    });
  });
});

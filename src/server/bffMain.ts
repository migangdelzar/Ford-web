import { createClient } from 'redis';
import { createBffApp } from './auth/createBffApp';
import { FordOidcClient } from './auth/oidcClient';
import { RedisBffSessionStore } from './auth/sessionStore';
import { HttpFordServiceClient } from './fordServiceClient';

const port = Number(process.env.PORT) || 3001;
const publicOrigin = required('FORD_PUBLIC_ORIGIN');
const fordServiceUrl = required('FORD_SERVICE_API_URL');
const issuerUrl = required('FORD_SECURITY_ISSUER_URI');
const clientId = required('FORD_BFF_OIDC_CLIENT_ID');
const clientSecret = required('FORD_BFF_OIDC_CLIENT_SECRET');
const redirectUri = required('FORD_BFF_OIDC_REDIRECT_URI');
const redisUrl = required('FORD_BFF_REDIS_URL');
const cookieSecure = process.env.FORD_BFF_COOKIE_SECURE !== 'false';

if (new URL(redirectUri).origin !== new URL(publicOrigin).origin) {
  throw new Error('BFF callback and public origin must share an origin');
}

const redis = createClient({ url: redisUrl });
redis.on('error', (error) => console.error('Ford BFF Redis error', error.name));
await redis.connect();

const app = createBffApp({
  auth: new FordOidcClient({
    issuerUrl,
    clientId,
    clientSecret,
    redirectUri,
    scopes: process.env.FORD_BFF_OIDC_SCOPES
      ?? 'openid profile email operator:read operator:write handoff:manage testlab:run',
  }),
  sessions: new RedisBffSessionStore(redis),
  service: new HttpFordServiceClient({ baseUrl: fordServiceUrl }),
  config: {
    publicOrigin,
    fordServiceUrl,
    sessionCookieName: 'ford_session',
    csrfCookieName: 'XSRF-TOKEN',
    cookieSecure,
  },
});

const server = app.listen(port, '0.0.0.0', () => {
  console.info(`Ford BFF listening on internal port ${port}`);
});

async function shutdown() {
  server.close();
  await redis.quit();
}

process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required in BFF mode`);
  return value;
}

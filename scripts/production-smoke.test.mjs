import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { afterEach, test } from 'node:test';
import { verifyProduction } from './production-smoke.mjs';

const servers = [];
const jsPath = '/assets/index-abcdef123456.js';
const cssPath = '/assets/index-abcdef123456.css';
const jsBody = Buffer.from('console.log("production bundle")');
const cssBody = Buffer.from('body{color:#123}');

async function startServer(handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

function response(res, status, contentType, body, headers = {}) {
  res.writeHead(status, { ...(contentType ? { 'content-type': contentType } : {}), ...headers });
  res.end(body);
}

async function fixtures({ leakRedirect = false, wrongAsset = false, wrongUpstreamAsset = false, badAssetCache = false, initialLoginFailures = 0 } = {}) {
  const html = `<!doctype html><html><head><link rel="stylesheet" href="${cssPath}"></head><body><script src="${jsPath}"></script></body></html>`;
  const upstream = await startServer((req, res) => {
    if (req.url === jsPath) return response(res, 200, 'application/javascript', wrongUpstreamAsset ? Buffer.from('different build') : jsBody, { 'cache-control': 'public, max-age=31536000, immutable' });
    if (req.url === cssPath) return response(res, 200, 'text/css', cssBody, { 'cache-control': 'public, max-age=31536000, immutable' });
    return response(res, 404, 'text/plain', 'not found');
  });
  let loginFailures = 0;
  const publicOrigin = await startServer((req, res) => {
    if (req.url === '/') return response(res, 302, 'text/plain', '', { location: '/login' });
    if (req.url === '/login' && leakRedirect) return response(res, 302, 'text/plain', '', { location: 'https://emme-crm-ui.pages.dev/login' });
    if (req.url === '/login' && loginFailures < initialLoginFailures) {
      loginFailures += 1;
      return response(res, 503, 'text/plain', 'edge is still propagating');
    }
    if (req.url === '/login' || req.url === '/dashboard') return response(res, 200, 'text/html', html, { 'cache-control': 'public, max-age=0, must-revalidate' });
    if (req.url === '/api/v1/health') return response(res, 200, 'application/json', '{}');
    if (req.url === '/.well-known/openid-configuration' || req.url === '/oauth2/jwks') return response(res, 200, 'application/json', '{}');
    if (req.url === '/oauth2/authorize?response_type=code&client_id=smoke') return response(res, 401, null, '');
    if (req.url === '/webhooks/meta/whatsapp') return response(res, 400, null, '');
    if (req.url === jsPath) return response(res, 200, wrongAsset ? 'text/html' : 'application/javascript', wrongAsset ? '<!doctype html>' : jsBody, { 'cache-control': badAssetCache ? 'public, max-age=0' : 'public, max-age=31536000, immutable' });
    if (req.url === cssPath) return response(res, 200, 'text/css', cssBody, { 'cache-control': 'public, max-age=31536000, immutable' });
    return response(res, 404, 'text/plain', 'not found');
  });
  return { publicOrigin, upstream };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

test('accepts same-origin routes and fingerprinted assets served through Spring', async () => {
  const { publicOrigin, upstream } = await fixtures();
  const result = await verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 1 });
  assert.equal(result.assets, 2);
  assert.equal(result.routes, 8);
});

test('rejects a redirect that exposes the Pages hostname', async () => {
  const { publicOrigin, upstream } = await fixtures({ leakRedirect: true });
  await assert.rejects(
    verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 1 }),
    /left the configured public origin/,
  );
});

test('rejects HTML fallbacks returned for fingerprinted JavaScript assets', async () => {
  const { publicOrigin, upstream } = await fixtures({ wrongAsset: true });
  await assert.rejects(
    verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 1 }),
    /unexpected content type/,
  );
});

test('rejects asset content that differs from the published Pages version', async () => {
  const { publicOrigin, upstream } = await fixtures({ wrongUpstreamAsset: true });
  await assert.rejects(
    verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 1 }),
    /does not match the Pages asset/,
  );
});

test('rejects fingerprinted assets without the immutable cache policy', async () => {
  const { publicOrigin, upstream } = await fixtures({ badAssetCache: true });
  await assert.rejects(
    verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 1 }),
    /one-year immutable cache policy/,
  );
});

test('retries while the public edge is propagating a deployment', async () => {
  const { publicOrigin, upstream } = await fixtures({ initialLoginFailures: 1 });
  const result = await verifyProduction({ publicOrigin, upstreamOrigin: upstream, attempts: 2, retryDelayMs: 1 });
  assert.equal(result.assets, 2);
});

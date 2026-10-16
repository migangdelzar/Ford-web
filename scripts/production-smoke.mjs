import { createHash } from 'node:crypto';

const DEFAULT_UPSTREAM_ORIGIN = 'https://emme-crm-ui.pages.dev';
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeOrigin(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }
  assert(url.protocol === 'https:' || url.hostname === '127.0.0.1' || url.hostname === 'localhost', `${name} must use HTTPS`);
  assert(url.pathname === '/' && !url.search && !url.hash, `${name} must be an origin without a path, query, or fragment`);
  return url.origin;
}

async function getSameOrigin(url, expectedOrigin, fetchImpl) {
  let current = new URL(url);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    assert(current.origin === expectedOrigin, `request left the configured public origin: ${current.origin}`);
    const response = await fetchImpl(current, {
      redirect: 'manual',
      headers: { 'user-agent': 'ford-production-smoke/1' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!REDIRECT_STATUSES.has(response.status)) return response;
    const location = response.headers.get('location');
    assert(location, `redirect from ${current.pathname} has no Location header`);
    current = new URL(location, current);
    assert(current.origin === expectedOrigin, `request left the configured public origin: ${current.origin}`);
  }
  throw new Error(`too many redirects while checking ${new URL(url).pathname}`);
}

function contentTypeMatches(actual, expected) {
  return actual.toLowerCase().split(';', 1)[0].trim() === expected;
}

function extractFingerprintAssets(html) {
  const assets = new Set();
  const pattern = /(?:src|href)=["'](\/assets\/[^"'?#]+\.(?:js|css))(?:\?[^"']*)?["']/gi;
  for (const match of html.matchAll(pattern)) {
    const asset = match[1];
    if (/^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(asset)) assets.add(asset);
  }
  return [...assets].sort();
}

async function readCheckedRoute(path, expectedStatus, expectedType, publicOrigin, fetchImpl) {
  const response = await getSameOrigin(new URL(path, publicOrigin), publicOrigin, fetchImpl);
  if (response.status !== expectedStatus) {
    await response.body?.cancel();
    throw new Error(`${path} returned HTTP ${response.status}; expected ${expectedStatus}`);
  }
  if (expectedType) {
    const type = response.headers.get('content-type') ?? '';
    assert(contentTypeMatches(type, expectedType), `${path} returned unexpected content type ${type || '(missing)'}`);
  }
  return response;
}

export async function verifyProduction({
  publicOrigin,
  upstreamOrigin = DEFAULT_UPSTREAM_ORIGIN,
  fetchImpl = fetch,
  attempts = 8,
  retryDelayMs = 5_000,
}) {
  const publicBase = normalizeOrigin(publicOrigin, 'FORD_WEB_SMOKE_URL');
  const upstreamBase = normalizeOrigin(upstreamOrigin, 'FORD_WEB_UI_UPSTREAM_URL');
  assert(Number.isInteger(attempts) && attempts > 0, 'attempts must be a positive integer');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await verifyOnce({ publicBase, upstreamBase, fetchImpl });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  throw lastError;
}

async function verifyOnce({ publicBase, upstreamBase, fetchImpl }) {
  const routes = [
    ['/login', 200, 'text/html'],
    ['/dashboard', 200, 'text/html'],
    ['/api/v1/health', 200, 'application/json'],
    ['/.well-known/openid-configuration', 200, 'application/json'],
    ['/oauth2/jwks', 200, 'application/json'],
    ['/oauth2/authorize?response_type=code&client_id=smoke', 401, null],
    ['/webhooks/meta/whatsapp', 400, null],
  ];

  const root = await getSameOrigin(new URL('/', publicBase), publicBase, fetchImpl);
  assert(root.status === 200, `public root returned HTTP ${root.status}; expected 200 after same-origin redirects`);
  let assetCount = 0;
  for (const [path, status, type] of routes) {
    const response = await readCheckedRoute(path, status, type, publicBase, fetchImpl);
    if (path === '/login') {
      const html = await response.text();
      assert(!html.toLowerCase().includes('pages.dev'), 'login HTML contains a Pages hostname');
      const htmlCacheControl = (response.headers.get('cache-control') ?? '').toLowerCase();
      assert(/(?:no-store|no-cache|max-age=0)/.test(htmlCacheControl), 'login HTML must not be cached as an immutable asset');
      const assets = extractFingerprintAssets(html);
      const jsAssets = assets.filter((asset) => asset.endsWith('.js'));
      const cssAssets = assets.filter((asset) => asset.endsWith('.css'));
      assert(jsAssets.length > 0 && cssAssets.length > 0, 'login page is missing fingerprinted JavaScript or CSS assets');
      assetCount = assets.length;
      for (const asset of assets) {
        const expectedType = asset.endsWith('.js') ? ['application/javascript', 'text/javascript'] : ['text/css'];
        const publicResponse = await getSameOrigin(new URL(asset, publicBase), publicBase, fetchImpl);
        assert(publicResponse.status === 200, `${asset} returned HTTP ${publicResponse.status}`);
        const publicType = (publicResponse.headers.get('content-type') ?? '').toLowerCase().split(';', 1)[0].trim();
        assert(expectedType.includes(publicType), `${asset} returned unexpected content type ${publicType || '(missing)'}`);
        const assetCacheControl = (publicResponse.headers.get('cache-control') ?? '').toLowerCase();
        assert(/max-age=31536000/.test(assetCacheControl) && /immutable/.test(assetCacheControl), `${asset} must use a one-year immutable cache policy`);
        const publicBody = Buffer.from(await publicResponse.arrayBuffer());
        assert(publicBody.length > 0 && !publicBody.toString('utf8', 0, 64).trimStart().toLowerCase().startsWith('<!doctype html'), `${asset} returned an HTML fallback`);

        const upstreamResponse = await fetchImpl(new URL(asset, upstreamBase), {
          redirect: 'error',
          headers: { 'user-agent': 'ford-production-smoke/1' },
          signal: AbortSignal.timeout(20_000),
        });
        assert(upstreamResponse.status === 200, `Pages upstream ${asset} returned HTTP ${upstreamResponse.status}`);
        const upstreamType = (upstreamResponse.headers.get('content-type') ?? '').toLowerCase().split(';', 1)[0].trim();
        assert(expectedType.includes(upstreamType), `Pages upstream ${asset} returned unexpected content type ${upstreamType || '(missing)'}`);
        const upstreamBody = Buffer.from(await upstreamResponse.arrayBuffer());
        const publicHash = createHash('sha256').update(publicBody).digest('hex');
        const upstreamHash = createHash('sha256').update(upstreamBody).digest('hex');
        assert(publicHash === upstreamHash, `${asset} served through Spring does not match the Pages asset`);
      }
    }
  }
  return { routes: routes.length + 1, assets: assetCount };
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const publicOrigin = process.env.FORD_WEB_SMOKE_URL;
  const upstreamOrigin = process.env.FORD_WEB_UI_UPSTREAM_URL || DEFAULT_UPSTREAM_ORIGIN;
  if (!publicOrigin) {
    console.error('Set FORD_WEB_SMOKE_URL to the public Spring-served origin.');
    process.exitCode = 2;
  } else {
    try {
      const result = await verifyProduction({ publicOrigin, upstreamOrigin });
      console.log(`Verified ${result.routes} public routes and ${result.assets} fingerprinted assets through Spring.`);
    } catch (error) {
      console.error(`Production smoke failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

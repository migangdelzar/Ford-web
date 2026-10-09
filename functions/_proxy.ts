const ALLOWED_PREFIXES = ['/api', '/oauth2', '/.well-known', '/login', '/webauthn'];
const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type', 'cookie', 'origin', 'referer', 'x-xsrf-token'];
const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  'connection', 'content-length', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'server',
]);

export async function proxyFordOriginRequest(
  request: Request,
  originUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const publicUrl = new URL(request.url);
  if (!isAllowedPath(publicUrl.pathname)) return Response.json({ error: 'route_not_found' }, { status: 404 });

  let origin: URL;
  try {
    origin = new URL(originUrl);
  } catch {
    return Response.json({ error: 'origin_configuration_invalid' }, { status: 500 });
  }
  if ((origin.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(origin.hostname))
    || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    return Response.json({ error: 'origin_configuration_invalid' }, { status: 500 });
  }

  const target = new URL(`${publicUrl.pathname}${publicUrl.search}`, origin);
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('x-forwarded-host', publicUrl.host);
  headers.set('x-forwarded-proto', publicUrl.protocol.slice(0, -1));

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;
  try {
    const upstream = await fetcher(target, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
      redirect: 'manual',
    });
    const responseHeaders = new Headers();
    for (const [name, value] of upstream.headers) {
      if (!HOP_BY_HOP_RESPONSE_HEADERS.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
        responseHeaders.set(name, value);
      }
    }
    for (const cookie of upstream.headers.getSetCookie?.() ?? []) responseHeaders.append('set-cookie', cookie);
    const location = upstream.headers.get('location');
    if (location) responseHeaders.set('location', rewriteInternalRedirect(location, origin, publicUrl));
    responseHeaders.set('cache-control', 'no-store');
    responseHeaders.set('x-content-type-options', 'nosniff');
    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch {
    return Response.json({ error: 'ford_origin_unavailable' }, { status: 502, headers: { 'cache-control': 'no-store' } });
  }
}

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function rewriteInternalRedirect(location: string, origin: URL, publicUrl: URL): string {
  try {
    const target = new URL(location, origin);
    if (target.origin !== origin.origin) return location;
    return `${publicUrl.origin}${target.pathname}${target.search}${target.hash}`;
  } catch {
    return location;
  }
}

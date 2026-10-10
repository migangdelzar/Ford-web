import { proxyFordOriginRequest, shouldRedirectRootToLogin, shouldUseFordWebLogin } from './_proxy';

interface PagesEnvironment {
  FORD_ORIGIN_URL: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnvironment;
  next(): Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  if (shouldRedirectRootToLogin(context.request)) {
    return Response.redirect(new URL('/login', context.request.url), 302);
  }
  const pathname = new URL(context.request.url).pathname;
  if (pathname === '/' && ['GET', 'HEAD'].includes(context.request.method)) return context.next();
  if (shouldUseFordWebLogin(context.request)) return context.next();
  return proxyFordOriginRequest(context.request, context.env.FORD_ORIGIN_URL);
}

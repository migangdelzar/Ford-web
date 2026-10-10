import { proxyFordOriginRequest, shouldUseFordWebLogin } from './_proxy';

interface PagesEnvironment {
  FORD_ORIGIN_URL: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnvironment;
  next(): Promise<Response>;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  if (shouldUseFordWebLogin(context.request)) return context.next();
  return proxyFordOriginRequest(context.request, context.env.FORD_ORIGIN_URL);
}

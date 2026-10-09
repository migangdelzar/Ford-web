import { proxyFordOriginRequest } from './_proxy';

interface PagesEnvironment {
  FORD_ORIGIN_URL: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnvironment;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return proxyFordOriginRequest(context.request, context.env.FORD_ORIGIN_URL);
}

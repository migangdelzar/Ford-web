import { shouldRedirectRootToLogin } from './_proxy';

interface RootPagesContext {
  request: Request;
  next(): Promise<Response>;
}

export async function onRequest(context: RootPagesContext): Promise<Response> {
  if (shouldRedirectRootToLogin(context.request)) {
    return Response.redirect(new URL('/login', context.request.url), 302);
  }
  return context.next();
}

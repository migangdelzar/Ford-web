export function unauthenticatedRedirect(pathname: string): string | null {
  return pathname === '/login' ? null : '/login';
}

export function authenticatedRedirect(pathname: string): string | null {
  return pathname === '/login' ? '/' : null;
}

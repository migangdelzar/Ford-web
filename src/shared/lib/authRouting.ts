export function unauthenticatedRedirect(pathname: string): string | null {
  return pathname === '/login' ? null : '/login';
}

export interface OperatorSession {
  operatorId: string;
  displayName: string;
  email: string;
  roles: string[];
  tenantIds: string[];
  hasPasskey: boolean;
}

export interface CsrfResponse {
  token: string;
  headerName: 'X-XSRF-TOKEN';
}

export async function readOperatorSession(): Promise<OperatorSession | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Operator session request failed (${response.status})`);
  const value: unknown = await response.json();
  if (!isOperatorSession(value)) throw new Error('Operator session response is invalid');
  return value;
}

export async function logoutOperator(): Promise<void> {
  const csrf = await readCsrfToken();
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { [csrf.headerName]: csrf.token },
  });
  if (response.status !== 204) throw new Error(`Logout request failed (${response.status})`);
}

export async function readCsrfToken(): Promise<CsrfResponse> {
  const response = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`CSRF initialization failed (${response.status})`);
  const csrf: unknown = await response.json();
  if (!csrf || typeof csrf !== 'object') throw new Error('CSRF response is invalid');
  const value = csrf as Partial<CsrfResponse>;
  if (!value.token || value.headerName !== 'X-XSRF-TOKEN') throw new Error('CSRF response is invalid');
  return { token: value.token, headerName: value.headerName };
}

function isOperatorSession(value: unknown): value is OperatorSession {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<OperatorSession>;
  return typeof profile.operatorId === 'string'
    && typeof profile.displayName === 'string'
    && typeof profile.email === 'string'
    && Array.isArray(profile.roles)
    && Array.isArray(profile.tenantIds)
    && typeof profile.hasPasskey === 'boolean';
}

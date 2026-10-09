export interface OperatorSession {
  operatorId: string;
  displayName: string;
  email: string;
  roles: string[];
  tenantIds: string[];
}

export interface LoginTransaction {
  state: string;
  nonce: string;
  codeVerifier: string;
  createdAt: number;
}

export interface StoredBffSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  profile: OperatorSession;
}

export interface AuthorizationRequest {
  authorizationUrl: string;
  state: string;
  transaction: LoginTransaction;
}

export interface BffAuthProvider {
  createAuthorizationRequest(): Promise<AuthorizationRequest>;
  completeAuthorization(callbackUrl: URL, transaction: LoginTransaction): Promise<Omit<StoredBffSession, 'profile'>>;
  refresh(session: StoredBffSession): Promise<StoredBffSession>;
}

export interface BffSessionStore {
  saveLoginTransaction(state: string, transaction: LoginTransaction): Promise<void>;
  consumeLoginTransaction(state: string): Promise<LoginTransaction | null>;
  createSession(session: StoredBffSession): Promise<string>;
  getSession(id: string): Promise<StoredBffSession | null>;
  updateSession(id: string, session: StoredBffSession): Promise<boolean>;
  deleteSession(id: string): Promise<void>;
}

export interface FordServiceClient {
  request(path: string, accessToken: string, init: RequestInit): Promise<Response>;
}

export interface BffConfig {
  publicOrigin: string;
  fordServiceUrl: string;
  sessionCookieName: string;
  csrfCookieName: string;
  cookieSecure: boolean;
}

export interface CreateBffAppOptions {
  auth: BffAuthProvider;
  sessions: BffSessionStore;
  service: FordServiceClient;
  config: BffConfig;
}

import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  ClientSecretBasic,
  discovery,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
  refreshTokenGrant,
  calculatePKCECodeChallenge,
  type Configuration,
} from 'openid-client';
import type { BffAuthProvider, LoginTransaction, StoredBffSession } from './types';

export interface OidcClientOptions {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
}

export class FordOidcClient implements BffAuthProvider {
  private readonly configuration: Promise<Configuration>;

  constructor(private readonly options: OidcClientOptions) {
    this.configuration = discovery(
      new URL(options.issuerUrl),
      options.clientId,
      options.clientSecret,
      ClientSecretBasic(options.clientSecret),
    );
  }

  async createAuthorizationRequest() {
    const codeVerifier = randomPKCECodeVerifier();
    const [configuration, codeChallenge] = await Promise.all([
      this.configuration,
      calculatePKCECodeChallenge(codeVerifier),
    ]);
    const state = randomState();
    const nonce = randomNonce();
    const transaction: LoginTransaction = { state, nonce, codeVerifier, createdAt: Date.now() };
    const authorizationUrl = buildAuthorizationUrl(configuration, {
      redirect_uri: this.options.redirectUri,
      scope: this.options.scopes,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return { authorizationUrl: authorizationUrl.href, state, transaction };
  }

  async completeAuthorization(callbackUrl: URL, transaction: LoginTransaction) {
    const tokens = await authorizationCodeGrant(await this.configuration, callbackUrl, {
      expectedState: transaction.state,
      expectedNonce: transaction.nonce,
      pkceCodeVerifier: transaction.codeVerifier,
    });
    const claims = tokens.claims();
    if (!claims?.sub || !tokens.access_token || !tokens.refresh_token) {
      throw new Error('Authorization server returned incomplete login credentials');
    }
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expiresIn() ?? 300) * 1000,
    };
  }

  async refresh(session: StoredBffSession): Promise<StoredBffSession> {
    const tokens = await refreshTokenGrant(await this.configuration, session.refreshToken);
    if (!tokens.access_token) throw new Error('Authorization server did not return an access token');
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + (tokens.expiresIn() ?? 300) * 1000,
      profile: session.profile,
    };
  }
}

import { readCsrfToken } from '../../shared/api/operatorAuth';

interface ServerCredentialDescriptor {
  id: string;
  type: 'public-key';
  transports?: AuthenticatorTransport[];
}

interface ServerRequestOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: ServerCredentialDescriptor[];
}

interface WebAuthnAuthenticationResponse {
  authenticated: boolean;
  redirectUrl?: string;
}

interface PasskeyLoginDependencies {
  fetcher?: typeof fetch;
  csrfReader?: typeof readCsrfToken;
  getCredential?: (options: PublicKeyCredentialRequestOptions) => Promise<PublicKeyCredential | null>;
  origin?: string;
}

export async function authenticateWithPasskey(dependencies: PasskeyLoginDependencies = {}): Promise<string> {
  const fetcher = dependencies.fetcher ?? fetch;
  const getCredential = dependencies.getCredential
    ?? ((options) => navigator.credentials.get({ publicKey: options }) as Promise<PublicKeyCredential | null>);
  const origin = dependencies.origin ?? window.location.origin;
  const csrf = await (dependencies.csrfReader ?? readCsrfToken)();

  const optionsResponse = await fetcher('/webauthn/authenticate/options', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', [csrf.headerName]: csrf.token },
  });
  if (!optionsResponse.ok) throw new Error('No se pudo iniciar la autenticación con passkey.');
  const options = await optionsResponse.json() as ServerRequestOptions;
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: decodeBase64Url(options.challenge),
    ...(options.rpId ? { rpId: options.rpId } : {}),
    ...(options.timeout ? { timeout: options.timeout } : {}),
    ...(options.userVerification ? { userVerification: options.userVerification } : {}),
    ...(options.allowCredentials
      ? { allowCredentials: options.allowCredentials.map((credential) => ({
        type: credential.type,
        id: decodeBase64Url(credential.id),
        ...(credential.transports ? { transports: credential.transports } : {}),
      })) }
      : {}),
  };

  const credential = await getCredential(publicKey);
  if (!credential || credential.type !== 'public-key') throw new Error('No se seleccionó una passkey.');
  const assertion = credential.response as AuthenticatorAssertionResponse;
  const authenticationResponse = await fetcher('/login/webauthn', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', 'content-type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify({
      id: credential.id,
      rawId: encodeBase64Url(credential.rawId),
      credType: credential.type,
      response: {
        authenticatorData: encodeBase64Url(assertion.authenticatorData),
        clientDataJSON: encodeBase64Url(assertion.clientDataJSON),
        signature: encodeBase64Url(assertion.signature),
        ...(assertion.userHandle ? { userHandle: encodeBase64Url(assertion.userHandle) } : {}),
      },
      clientExtensionResults: credential.getClientExtensionResults(),
      authenticatorAttachment: credential.authenticatorAttachment,
    }),
  });
  if (!authenticationResponse.ok) throw new Error('La passkey no pudo verificar su identidad.');

  const result = await authenticationResponse.json() as WebAuthnAuthenticationResponse;
  if (!result.authenticated) throw new Error('La passkey no pudo verificar su identidad.');
  const destination = new URL(result.redirectUrl || '/', origin);
  if (destination.origin !== origin) throw new Error('Authentication returned an invalid redirect');
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

function encodeBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

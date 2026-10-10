import { readBffCsrfToken } from '../../shared/api/operatorAuth';

interface RegistrationCredentialDescriptor extends Omit<PublicKeyCredentialDescriptor, 'id'> {
  id: string;
}

interface ServerRegistrationOptions extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'user' | 'excludeCredentials'> {
  challenge: string;
  user: Omit<PublicKeyCredentialUserEntity, 'id'> & { id: string };
  excludeCredentials?: RegistrationCredentialDescriptor[];
}

interface PasskeyRegistrationDependencies {
  fetcher?: typeof fetch;
  csrfReader?: typeof readBffCsrfToken;
  createCredential?: (options: PublicKeyCredentialCreationOptions) => Promise<PublicKeyCredential | null>;
}

export async function registerPasskey(dependencies: PasskeyRegistrationDependencies = {}): Promise<void> {
  const fetcher = dependencies.fetcher ?? fetch;
  const createCredential = dependencies.createCredential
    ?? ((options) => navigator.credentials.create({ publicKey: options }) as Promise<PublicKeyCredential | null>);
  if (!dependencies.createCredential
    && (!('credentials' in navigator) || typeof navigator.credentials.create !== 'function')) {
    throw new Error('Este navegador no admite passkeys.');
  }

  const csrf = await (dependencies.csrfReader ?? readBffCsrfToken)();
  const optionsResponse = await fetcher('/webauthn/register/options', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', [csrf.headerName]: csrf.token },
  });
  if (!optionsResponse.ok) throw new Error('No se pudo iniciar el registro de la passkey.');

  const options = await optionsResponse.json() as ServerRegistrationOptions;
  const { challenge, user, excludeCredentials, ...otherOptions } = options;
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...otherOptions,
    challenge: decodeBase64Url(challenge),
    user: { ...user, id: decodeBase64Url(user.id) },
    ...(excludeCredentials
      ? { excludeCredentials: excludeCredentials.map((credential) => ({
        ...credential,
        id: decodeBase64Url(credential.id),
      })) }
      : {}),
  };

  const credential = await createCredential(publicKey);
  if (!credential || credential.type !== 'public-key') throw new Error('No se creó una passkey.');

  const attestation = credential.response as AuthenticatorAttestationResponse;
  const registrationResponse = await fetcher('/webauthn/register', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', 'content-type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify({
      publicKey: {
        credential: {
          id: credential.id,
          rawId: encodeBase64Url(credential.rawId),
          response: {
            attestationObject: encodeBase64Url(attestation.attestationObject),
            clientDataJSON: encodeBase64Url(attestation.clientDataJSON),
            ...(typeof attestation.getTransports === 'function' ? { transports: attestation.getTransports() } : {}),
          },
          type: credential.type,
          clientExtensionResults: credential.getClientExtensionResults(),
          authenticatorAttachment: credential.authenticatorAttachment,
        },
        label: 'Ford-web',
      },
    }),
  });
  if (!registrationResponse.ok) throw new Error('El servidor no pudo guardar la passkey.');
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

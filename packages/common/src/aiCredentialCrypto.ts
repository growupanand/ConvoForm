/**
 * Envelope encryption for organization AI provider credentials (BYOK).
 *
 * Every credential gets its own random AES-256-GCM data key. The data key is
 * wrapped by a master key that only lives in the server environment
 * (`AI_CREDENTIALS_MASTER_KEY`), and the sealed data key is stored next to the
 * ciphertext. A credential row therefore never holds a key that can decrypt
 * itself.
 *
 * The organization id and provider id are bound as additional authenticated
 * data, so a ciphertext copied onto another org's row fails to decrypt.
 *
 * Wrapped data keys carry the master key version they were sealed with. A new
 * master key can be rolled out by re-wrapping the data keys, without
 * re-encrypting the secrets or touching the plaintext.
 */

const FORMAT_VERSION = 1;
const DATA_KEY_BYTES = 32;
const MASTER_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const AAD_PREFIX = "convoform:ai-credential";

export class AiCredentialCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiCredentialCryptoError";
  }
}

export type AiCredentialCiphertext = {
  /** Base64 AES-GCM ciphertext of the provider secret */
  encryptedSecret: string;
  /** Base64 GCM IV used for `encryptedSecret` */
  iv: string;
  /** `formatVersion.wrapIv.wrappedKey`, all base64 after the first dot */
  wrappedDataKey: string;
  /** Master key version that wrapped the data key */
  keyVersion: number;
};

export type EncryptAiCredentialSecretParams = {
  secret: string;
  organizationId: string;
  provider: string;
  /** Base64 (or 64-char hex) 32-byte master key */
  masterKey: string;
  keyVersion: number;
};

export type DecryptAiCredentialSecretParams = {
  ciphertext: AiCredentialCiphertext;
  organizationId: string;
  provider: string;
  /** Master key matching `ciphertext.keyVersion` */
  masterKey: string;
};

export type RewrapAiCredentialSecretParams = {
  ciphertext: AiCredentialCiphertext;
  organizationId: string;
  provider: string;
  /** Master key matching `ciphertext.keyVersion` */
  sourceMasterKey: string;
  /** Master key for `targetKeyVersion` */
  targetMasterKey: string;
  targetKeyVersion: number;
};

/**
 * Encrypts a provider secret with a fresh data key and wraps that data key
 * with the master key.
 */
export async function encryptAiCredentialSecret({
  secret,
  organizationId,
  provider,
  masterKey,
  keyVersion,
}: EncryptAiCredentialSecretParams): Promise<AiCredentialCiphertext> {
  assertNonEmpty(secret, "AI provider secret is required");
  assertKeyVersion(keyVersion);

  const dataKey = crypto.getRandomValues(new Uint8Array(DATA_KEY_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_BYTES));

  const encryptedSecret = await encryptBytes({
    plaintext: new TextEncoder().encode(secret),
    key: dataKey,
    iv,
    additionalData: buildSecretAad(organizationId, provider),
  });

  const wrapped = await wrapDataKey({
    dataKey,
    masterKey,
    organizationId,
    provider,
    keyVersion,
  });

  return {
    encryptedSecret: toBase64(encryptedSecret),
    iv: toBase64(iv),
    wrappedDataKey: formatWrappedDataKey(wrapped),
    keyVersion,
  };
}

/**
 * Decrypts a stored provider secret. The caller is responsible for passing the
 * master key for `ciphertext.keyVersion`.
 */
export async function decryptAiCredentialSecret({
  ciphertext,
  organizationId,
  provider,
  masterKey,
}: DecryptAiCredentialSecretParams): Promise<string> {
  assertKeyVersion(ciphertext.keyVersion);

  const dataKey = await unwrapDataKey({
    wrappedDataKey: ciphertext.wrappedDataKey,
    masterKey,
    organizationId,
    provider,
    keyVersion: ciphertext.keyVersion,
  });

  const iv = fromBase64(ciphertext.iv);
  if (iv.byteLength !== GCM_IV_BYTES) {
    throw new AiCredentialCryptoError("Invalid AI credential ciphertext");
  }

  const plaintext = await decryptBytes({
    ciphertext: fromBase64(ciphertext.encryptedSecret),
    key: dataKey,
    iv,
    additionalData: buildSecretAad(organizationId, provider),
  });

  return new TextDecoder().decode(plaintext);
}

/**
 * Re-wraps the data key with a newer master key.
 *
 * The secret ciphertext is left untouched; only the sealed data key and the
 * stored key version change. Records that have not been re-wrapped stay
 * decryptable as long as the old master key is still configured
 * (`AI_CREDENTIALS_MASTER_KEY_V<version>`).
 */
export async function rewrapAiCredentialSecret({
  ciphertext,
  organizationId,
  provider,
  sourceMasterKey,
  targetMasterKey,
  targetKeyVersion,
}: RewrapAiCredentialSecretParams): Promise<AiCredentialCiphertext> {
  assertKeyVersion(ciphertext.keyVersion);
  assertKeyVersion(targetKeyVersion);

  const dataKey = await unwrapDataKey({
    wrappedDataKey: ciphertext.wrappedDataKey,
    masterKey: sourceMasterKey,
    organizationId,
    provider,
    keyVersion: ciphertext.keyVersion,
  });

  const wrapped = await wrapDataKey({
    dataKey,
    masterKey: targetMasterKey,
    organizationId,
    provider,
    keyVersion: targetKeyVersion,
  });

  return {
    encryptedSecret: ciphertext.encryptedSecret,
    iv: ciphertext.iv,
    wrappedDataKey: formatWrappedDataKey(wrapped),
    keyVersion: targetKeyVersion,
  };
}

/** Last four characters of a secret, for display only. Never log the secret. */
export function getAiCredentialLast4(secret: string): string {
  return secret.slice(-4);
}

type WrappedDataKey = {
  iv: Uint8Array;
  ciphertext: Uint8Array;
};

async function wrapDataKey(params: {
  dataKey: Uint8Array;
  masterKey: string;
  organizationId: string;
  provider: string;
  keyVersion: number;
}): Promise<WrappedDataKey> {
  const masterKeyBytes = decodeMasterKey(params.masterKey);
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_BYTES));

  const ciphertext = await encryptBytes({
    plaintext: params.dataKey,
    key: masterKeyBytes,
    iv,
    additionalData: buildWrappedKeyAad(
      params.organizationId,
      params.provider,
      params.keyVersion,
    ),
  });

  return { iv, ciphertext };
}

async function unwrapDataKey(params: {
  wrappedDataKey: string;
  masterKey: string;
  organizationId: string;
  provider: string;
  keyVersion: number;
}): Promise<Uint8Array> {
  const { iv, ciphertext } = parseWrappedDataKey(params.wrappedDataKey);

  const dataKey = await decryptBytes({
    ciphertext,
    key: decodeMasterKey(params.masterKey),
    iv,
    additionalData: buildWrappedKeyAad(
      params.organizationId,
      params.provider,
      params.keyVersion,
    ),
  });

  if (dataKey.byteLength !== DATA_KEY_BYTES) {
    throw new AiCredentialCryptoError("Invalid AI credential ciphertext");
  }

  return dataKey;
}

async function encryptBytes(params: {
  plaintext: Uint8Array;
  key: Uint8Array;
  iv: Uint8Array;
  additionalData: Uint8Array;
}): Promise<Uint8Array> {
  try {
    const cryptoKey = await importAesKey(params.key);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: params.iv,
        additionalData: params.additionalData,
      },
      cryptoKey,
      params.plaintext,
    );

    return new Uint8Array(encrypted);
  } catch {
    throw new AiCredentialCryptoError("Unable to encrypt the AI credential");
  }
}

async function decryptBytes(params: {
  ciphertext: Uint8Array;
  key: Uint8Array;
  iv: Uint8Array;
  additionalData: Uint8Array;
}): Promise<Uint8Array> {
  try {
    const cryptoKey = await importAesKey(params.key);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: params.iv,
        additionalData: params.additionalData,
      },
      cryptoKey,
      params.ciphertext,
    );

    return new Uint8Array(decrypted);
  } catch {
    // Never include the DOMException message: it can differ between runtimes
    // and this path is reached with attacker-controlled ciphertext.
    throw new AiCredentialCryptoError("Unable to decrypt the AI credential");
  }
}

async function importAesKey(key: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", key, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function decodeMasterKey(masterKey: string): Uint8Array {
  const trimmed = masterKey.trim();

  let bytes: Uint8Array;
  try {
    bytes = /^[0-9a-f]{64}$/i.test(trimmed)
      ? fromHex(trimmed)
      : fromBase64(trimmed);
  } catch {
    throw new AiCredentialCryptoError(
      "AI credential master key must be 32 bytes",
    );
  }

  if (bytes.byteLength !== MASTER_KEY_BYTES) {
    throw new AiCredentialCryptoError(
      "AI credential master key must be 32 bytes",
    );
  }

  return bytes;
}

function buildSecretAad(organizationId: string, provider: string): Uint8Array {
  return new TextEncoder().encode(
    `${AAD_PREFIX}:secret:${organizationId}:${provider}`,
  );
}

function buildWrappedKeyAad(
  organizationId: string,
  provider: string,
  keyVersion: number,
): Uint8Array {
  return new TextEncoder().encode(
    `${AAD_PREFIX}:data-key:${organizationId}:${provider}:${keyVersion}`,
  );
}

function formatWrappedDataKey({ iv, ciphertext }: WrappedDataKey): string {
  return `${FORMAT_VERSION}.${toBase64(iv)}.${toBase64(ciphertext)}`;
}

function parseWrappedDataKey(wrappedDataKey: string): WrappedDataKey {
  const match = /^(\d+)\.([A-Za-z0-9+/=]+)\.([A-Za-z0-9+/=]+)$/.exec(
    wrappedDataKey,
  );

  if (!match || Number(match[1]) !== FORMAT_VERSION) {
    throw new AiCredentialCryptoError(
      "Unsupported AI credential encryption format",
    );
  }

  const iv = fromBase64(match[2] ?? "");
  if (iv.byteLength !== GCM_IV_BYTES) {
    throw new AiCredentialCryptoError("Invalid AI credential ciphertext");
  }

  return {
    iv,
    ciphertext: fromBase64(match[3] ?? ""),
  };
}

function assertNonEmpty(value: string, message: string) {
  if (!value) {
    throw new AiCredentialCryptoError(message);
  }
}

function assertKeyVersion(keyVersion: number) {
  if (!Number.isInteger(keyVersion) || keyVersion < 1) {
    throw new AiCredentialCryptoError("Invalid AI credential key version");
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    throw new AiCredentialCryptoError("Invalid AI credential ciphertext");
  }
}

function fromHex(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

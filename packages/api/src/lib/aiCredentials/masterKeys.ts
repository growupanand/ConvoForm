/**
 * Server-only access to the BYOK master keys.
 *
 * `AI_CREDENTIALS_MASTER_KEY` holds the current master key and
 * `AI_CREDENTIALS_MASTER_KEY_VERSION` its version (default `1`). Older keys
 * live in `AI_CREDENTIALS_MASTER_KEY_V<version>` while records are re-wrapped.
 *
 * Neither value is ever logged or returned by an API.
 */

export const DEFAULT_MASTER_KEY_VERSION = 1;

export class AiCredentialMasterKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiCredentialMasterKeyError";
  }
}

export function getCurrentAiCredentialKeyVersion(): number {
  const raw = process.env.AI_CREDENTIALS_MASTER_KEY_VERSION?.trim();
  if (!raw) {
    return DEFAULT_MASTER_KEY_VERSION;
  }

  const version = Number(raw);
  if (!Number.isInteger(version) || version < 1) {
    throw new AiCredentialMasterKeyError(
      "AI_CREDENTIALS_MASTER_KEY_VERSION must be a positive integer",
    );
  }

  return version;
}

export function getAiCredentialMasterKey(keyVersion: number): string {
  const currentVersion = getCurrentAiCredentialKeyVersion();
  const value =
    keyVersion === currentVersion
      ? process.env.AI_CREDENTIALS_MASTER_KEY
      : process.env[`AI_CREDENTIALS_MASTER_KEY_V${keyVersion}`];

  if (!value?.trim()) {
    throw new AiCredentialMasterKeyError(
      "AI credential encryption is not configured",
    );
  }

  return value.trim();
}

export function getCurrentAiCredentialMasterKey(): string {
  return getAiCredentialMasterKey(getCurrentAiCredentialKeyVersion());
}

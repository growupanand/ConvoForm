import { signPayload, verifySignature } from "./crypto";

const TOKEN_VERSION = "v1";

export const CONVERSATION_TOKEN_TTL_SECONDS = 60 * 60 * 24;

export type ConversationTokenPayload = {
  conversationId: string;
  formId: string;
  organizationId: string;
  /** Unix timestamp in seconds. */
  expiresAt: number;
};

type CreateConversationTokenOptions = {
  secret: string;
  expiresInSeconds?: number;
  nowSeconds?: number;
};

/**
 * Create a signed, expiring token that proves the bearer is the respondent of a
 * single conversation.
 *
 * The token is deliberately self-contained (no database row) so it can be
 * issued from a streaming route and verified on every later request.
 */
export async function createConversationToken(
  payload: Omit<ConversationTokenPayload, "expiresAt">,
  {
    secret,
    expiresInSeconds = CONVERSATION_TOKEN_TTL_SECONDS,
    nowSeconds = Math.floor(Date.now() / 1000),
  }: CreateConversationTokenOptions,
): Promise<string> {
  const tokenPayload: ConversationTokenPayload = {
    ...payload,
    expiresAt: nowSeconds + expiresInSeconds,
  };
  const encodedPayload = encodePayload(tokenPayload);
  const signedContent = `${TOKEN_VERSION}.${encodedPayload}`;
  const signature = await signPayload(signedContent, secret);

  return `${signedContent}.${signature}`;
}

/**
 * Verify a conversation token. Returns `null` for anything malformed, expired,
 * signed with another secret, or not bound to the expected conversation.
 */
export async function verifyConversationToken(
  token: string,
  {
    secret,
    conversationId,
    nowSeconds = Math.floor(Date.now() / 1000),
  }: {
    secret: string;
    conversationId?: string;
    nowSeconds?: number;
  },
): Promise<ConversationTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [version, encodedPayload, signature] = parts;
  if (version !== TOKEN_VERSION || !encodedPayload || !signature) {
    return null;
  }

  let isValid = false;
  try {
    isValid = await verifySignature(
      `${version}.${encodedPayload}`,
      signature,
      secret,
    );
  } catch {
    return null;
  }

  if (!isValid) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.expiresAt <= nowSeconds) {
    return null;
  }

  if (conversationId && payload.conversationId !== conversationId) {
    return null;
  }

  return payload;
}

function encodePayload(payload: ConversationTokenPayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodePayload(
  encodedPayload: string,
): ConversationTokenPayload | null {
  try {
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }

    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    if (!isConversationTokenPayload(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isConversationTokenPayload(
  value: unknown,
): value is ConversationTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.conversationId === "string" &&
    payload.conversationId.length > 0 &&
    typeof payload.formId === "string" &&
    payload.formId.length > 0 &&
    typeof payload.organizationId === "string" &&
    payload.organizationId.length > 0 &&
    typeof payload.expiresAt === "number" &&
    Number.isFinite(payload.expiresAt)
  );
}

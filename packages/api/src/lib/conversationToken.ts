import {
  type ConversationTokenPayload,
  verifyConversationToken,
} from "@convoform/common";
import { TRPCError } from "@trpc/server";

export const CONVERSATION_TOKEN_COOKIE_PREFIX = "convoform_conversation_";
const CONVERSATION_TOKEN_HEADER = "x-conversation-token";

export function getConversationTokenCookieName(conversationId: string) {
  return `${CONVERSATION_TOKEN_COOKIE_PREFIX}${conversationId}`;
}

export function getConversationTokenSigningSecret() {
  return (
    process.env.CONVERSATION_TOKEN_SECRET ||
    process.env.INTERNAL_EMAIL_API_SECRET ||
    ""
  );
}

/**
 * Read a conversation token from the explicit header or the per-conversation
 * HttpOnly cookie. The header is useful for non-browser callers and tests.
 */
export function getConversationTokenFromHeaders(
  headers: Headers | undefined,
  conversationId?: string,
): string | undefined {
  const headerToken = getExplicitToken(headers);
  if (headerToken) {
    return headerToken;
  }

  if (!conversationId) {
    return undefined;
  }

  const cookies = parseCookieHeader(headers?.get("cookie"));
  return cookies[getConversationTokenCookieName(conversationId)];
}

/**
 * Verify the token bound to a specific conversation. Returns `null` when the
 * token is missing, malformed, expired, signed with another secret, or belongs
 * to a different conversation.
 */
export async function getVerifiedConversationToken(
  headers: Headers | undefined,
  conversationId: string,
): Promise<ConversationTokenPayload | null> {
  const token = getConversationTokenFromHeaders(headers, conversationId);
  if (!token) {
    return null;
  }

  return await verifyConversationToken(token, {
    secret: getConversationTokenSigningSecret(),
    conversationId,
  });
}

export async function assertConversationToken(
  headers: Headers | undefined,
  conversationId: string,
) {
  const payload = await getVerifiedConversationToken(headers, conversationId);

  if (!payload) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "A valid conversation token is required",
    });
  }

  return payload;
}

/**
 * Find any valid conversation token. Used by procedures that are scoped by
 * organization rather than by a single conversation.
 */
export async function findVerifiedConversationToken(
  headers: Headers | undefined,
): Promise<ConversationTokenPayload | null> {
  const explicitToken = getExplicitToken(headers);
  if (explicitToken) {
    return await verifyConversationToken(explicitToken, {
      secret: getConversationTokenSigningSecret(),
    });
  }

  const cookies = parseCookieHeader(headers?.get("cookie"));
  for (const [name, token] of Object.entries(cookies)) {
    if (!name.startsWith(CONVERSATION_TOKEN_COOKIE_PREFIX)) {
      continue;
    }

    const payload = await verifyConversationToken(token, {
      secret: getConversationTokenSigningSecret(),
    });
    if (payload) {
      return payload;
    }
  }

  return null;
}

function getExplicitToken(headers: Headers | undefined) {
  const headerToken = headers?.get(CONVERSATION_TOKEN_HEADER);
  if (headerToken) {
    return headerToken;
  }

  const authorization = headers?.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return undefined;
}

function parseCookieHeader(cookieHeader: string | null | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) {
      continue;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
  }

  return cookies;
}

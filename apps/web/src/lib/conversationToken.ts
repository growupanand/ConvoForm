import { ConversationAccessError } from "@convoform/api/src/actions/conversation/getTrustedConversationForRespondent";
import {
  getConversationTokenCookieName,
  getConversationTokenSigningSecret,
  getVerifiedConversationToken,
} from "@convoform/api/src/lib/conversationToken";
import {
  CONVERSATION_TOKEN_TTL_SECONDS,
  createConversationToken,
} from "@convoform/common";

type ConversationTokenInput = {
  conversationId: string;
  formId: string;
  organizationId: string;
};

/**
 * Issue a signed token and attach it as an HttpOnly, same-site cookie.
 */
export async function attachConversationToken(
  response: Response,
  conversation: ConversationTokenInput,
) {
  const token = await createConversationToken(conversation, {
    secret: getConversationTokenSigningSecret(),
  });

  response.headers.append(
    "Set-Cookie",
    serializeConversationCookie(conversation.conversationId, token),
  );

  return response;
}

export async function hasValidConversationToken(
  request: Request,
  conversationId: string,
) {
  const payload = await getVerifiedConversationToken(
    request.headers,
    conversationId,
  );

  return payload != null;
}

export async function assertRequestConversationToken(
  request: Request,
  conversationId: string,
) {
  if (!(await hasValidConversationToken(request, conversationId))) {
    throw new ConversationAccessError(
      "A valid conversation token is required",
      401,
    );
  }
}

/**
 * Expire the conversation cookie as soon as the form is completed.
 */
export function clearConversationToken(
  response: Response,
  conversationId: string,
) {
  response.headers.append(
    "Set-Cookie",
    serializeConversationCookie(conversationId, "", {
      maxAge: 0,
      expires: "Thu, 01 Jan 1970 00:00:00 GMT",
    }),
  );

  return response;
}

function serializeConversationCookie(
  conversationId: string,
  token: string,
  options: { maxAge?: number; expires?: string } = {},
) {
  const parts = [
    `${getConversationTokenCookieName(conversationId)}=${token}`,
    "Path=/api",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${options.maxAge ?? CONVERSATION_TOKEN_TTL_SECONDS}`,
  ];

  if (options.expires) {
    parts.push(`Expires=${options.expires}`);
  }

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

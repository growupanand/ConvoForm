import { env } from "@convoform/api/src/env";
import { verifySignature } from "@convoform/common";
import { type NextRequest, NextResponse } from "next/server";

const SIGNATURE_HEADER = "X-ConvoForm-Signature";

export type InternalRequestVerification =
  | { ok: true; rawBody: string }
  | { ok: false; response: NextResponse };

/**
 * Verify `X-ConvoForm-Signature`, an HMAC-SHA256 of the raw request body,
 * using the same shared secret as the existing internal tRPC procedures.
 */
export async function verifyInternalRequest(
  request: NextRequest,
): Promise<InternalRequestVerification> {
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);

  if (!signature) {
    return unauthorized("Missing internal request signature");
  }

  let isValid = false;
  try {
    isValid = await verifySignature(
      rawBody,
      signature,
      env.INTERNAL_EMAIL_API_SECRET,
    );
  } catch (error) {
    console.error("Failed to verify internal request signature", error);
  }

  if (!isValid) {
    return unauthorized("Invalid internal request signature");
  }

  return { ok: true, rawBody };
}

function unauthorized(message: string): InternalRequestVerification {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

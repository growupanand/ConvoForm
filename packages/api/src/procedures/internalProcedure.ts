import { verifySignature } from "@convoform/common";
import { TRPCError } from "@trpc/server";
import { env } from "../env";
import { publicProcedure } from "./publicProcedure";

const SIGNATURE_HEADER = "X-ConvoForm-Signature";

/**
 * Internal (server-to-server) procedure
 *
 * Requires a valid `X-ConvoForm-Signature` header, an HMAC-SHA256 signature of
 * the raw request body. Use this for procedures that must only be called by our
 * own server and must never be reachable from a browser.
 */
export const internalProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const signature = ctx.headers?.get(SIGNATURE_HEADER);

  if (!signature) {
    throw unauthorized("Missing internal request signature");
  }

  if (!ctx.rawBody) {
    throw unauthorized("Raw request body is unavailable");
  }

  let isValid = false;
  try {
    isValid = await verifySignature(
      ctx.rawBody,
      signature,
      env.INTERNAL_EMAIL_API_SECRET,
    );
  } catch (error) {
    console.error("Failed to verify internal request signature", error);
  }

  if (!isValid) {
    throw unauthorized("Invalid internal request signature");
  }

  return next();
});

function unauthorized(message: string) {
  return new TRPCError({
    code: "UNAUTHORIZED",
    message,
  });
}

import { signPayload } from "@convoform/common";
import type { WebhookDeliveryResult } from "@convoform/db/src/schema";
import { env } from "../../env";
import { getBaseUrl } from "../../utils/url";

/**
 * Report a delivery outcome to the internal Next.js route. Running this over
 * HTTP (instead of touching the DB here) keeps the self-host adapter on the
 * same code path as the Cloudflare worker and keeps Node-only work, such as
 * sending the "endpoint disabled" email, out of the Edge runtime.
 */
export async function reportWebhookDeliveryResult(
  input: WebhookDeliveryResult,
): Promise<void> {
  const body = JSON.stringify(input);
  const signature = await signPayload(body, env.INTERNAL_EMAIL_API_SECRET);

  const response = await fetch(
    `${getBaseUrl()}/api/internal/webhook-delivery-result`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-ConvoForm-Signature": signature,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to report webhook delivery result (status ${response.status})`,
    );
  }
}

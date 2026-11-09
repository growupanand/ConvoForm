import { db } from "@convoform/db";
import { env } from "../../env";
import type { ActionContext } from "../../types/actionContextType";
import {
  type CloudflareWebhookDeliveryOptions,
  deliverWebhookWithCloudflare,
  isCloudflareWebhookDeliveryConfigured,
} from "./cloudflareWebhookDelivery";
import {
  type SendWebhookOptions,
  deliverWebhookDirectly,
} from "./directWebhookDelivery";

export type WebhookDeliveryEngine = "cloudflare" | "direct";

export interface DeliverWebhookOptions {
  /** Override runtime auto-detection. Mostly useful in tests. */
  engine?: WebhookDeliveryEngine;
  cloudflare?: CloudflareWebhookDeliveryOptions;
  direct?: SendWebhookOptions;
}

/**
 * Pick the delivery engine.
 *
 * Cloudflare Workflows is used only when all three `CF_*` variables are set,
 * so self-hosters keep the direct best-effort adapter by default.
 */
export function resolveWebhookDeliveryEngine(
  runtimeEnv: Record<string, string | undefined> = env,
): WebhookDeliveryEngine {
  return isCloudflareWebhookDeliveryConfigured(runtimeEnv)
    ? "cloudflare"
    : "direct";
}

/**
 * Deliver one webhook row.
 *
 * The caller (fan-out in `patchConversation`) treats this as fire-and-forget:
 * it must never throw into the response-completion path.
 */
export async function deliverWebhook(
  deliveryId: string,
  ctx: ActionContext = { db },
  options: DeliverWebhookOptions = {},
): Promise<void> {
  const engine = options.engine ?? resolveWebhookDeliveryEngine();

  if (engine === "cloudflare") {
    await deliverWebhookWithCloudflare(deliveryId, ctx, options.cloudflare);
    return;
  }

  await deliverWebhookDirectly(deliveryId, ctx, options.direct);
}

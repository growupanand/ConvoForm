import { z } from "zod/v4";

export const webhookEventTypeSchema = z.enum(["response.completed"]);
export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;

export const webhookDeliveryStatusSchema = z.enum([
  "pending",
  "delivering",
  "success",
  "failed",
]);
export type WebhookDeliveryStatus = z.infer<typeof webhookDeliveryStatusSchema>;

export const webhookDeliveryResultSchema = z.object({
  deliveryId: z.string().min(1),
  success: z.boolean(),
  statusCode: z.number().int().min(100).max(599).nullable().optional(),
  latencyMs: z.number().int().min(0).nullable().optional(),
  error: z.string().max(2000).nullable().optional(),
  attempts: z.number().int().min(0).max(100).optional(),
});
export type WebhookDeliveryResult = z.infer<typeof webhookDeliveryResultSchema>;

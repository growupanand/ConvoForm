import { z } from "zod/v4";

export const userIdentity = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type UserIdentity = z.infer<typeof userIdentity>;

export const eventAction = z.enum(["create", "delete", "update", "view"]);
export type EventAction = z.infer<typeof eventAction>;

export const eventObject = z.enum([
  "form",
  "conversation",
  "formField",
  "formDesign",
  "organization",
  "user",
  "collectData",
  "organizationMember",
  "fileUpload",
]);
export type EventObject = z.infer<typeof eventObject>;

export type EventName = `${EventObject}:${EventAction}`;

export const eventGroupName = z.enum(["organization"]);

export type EventGroupName = z.infer<typeof eventGroupName>;

export const eventProperties = z
  .object({
    appVersion: z.string().min(1).optional(),
  })
  .catchall(z.any());

export type EventProperties = z.infer<typeof eventProperties>;

// =============================================================
// ============== LLM Analytics Schema ======================
// =============================================================

export const llmActionType = z.enum([
  "extractFieldAnswer",
  "generateFieldQuestion",
  "generateConversationName",
  "generateEndMessage",
  "generateFormFields",
  "generateFormMetadata",
]);

export type LLMActionType = z.infer<typeof llmActionType>;

export const llmAnalyticsMetadata = z
  .object({
    // Core identifiers
    userId: z.string().optional(),
    traceId: z.string().optional(),
    formId: z.string().optional(),
    conversationId: z.string().optional(),
    organizationId: z.string().optional(),

    // LLM specific context
    actionType: llmActionType.optional(),

    // Additional context
    isAnonymous: z.boolean().optional(),
    modelProvider: z.string().optional(),
    modelName: z.string().optional(),
  })
  .catchall(z.unknown());

export type LLMAnalyticsMetadata = z.infer<typeof llmAnalyticsMetadata>;

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { selectFormFieldSchema } from "../formFields";
import { selectFormSchema } from "../forms";
import { conversation } from "./conversation";

// =============================================================
// ============== Conversation METADATA ========================

// Reference: node_modules/.pnpm/next@15.4.0-canary.7_@opentelemetry+api@1.9.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/web/spec-extension/user-agent.d.ts
export const userAgentSchema = z
  .object({
    isBot: z.boolean().optional(),
    ua: z.string().optional(),
    browser: z
      .object({
        name: z.string().optional(),
        version: z.string().optional(),
        major: z.string().optional(),
      })
      .optional(),
    device: z
      .object({
        model: z.string().optional(),
        type: z.string().optional(),
        vendor: z.string().optional(),
      })
      .optional(),
    engine: z
      .object({
        name: z.string().optional(),
        version: z.string().optional(),
      })
      .optional(),
    os: z
      .object({
        name: z.string().optional(),
        version: z.string().optional(),
      })
      .optional(),
    cpu: z
      .object({
        architecture: z.string().optional(),
      })
      .optional(),
  })
  .partial();

// // Reference: node_modules/.pnpm/@vercel+functions@2.0.3/node_modules/@vercel/functions/headers.d.ts
export const geoDetailsSchema = z
  .object({
    city: z.string().optional(),
    country: z.string().optional(),
    flag: z.string().optional(),
    region: z.string().optional(),
    countryRegion: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .partial();

// Define enums for tone and sentiment
export const userToneEnum = z.enum([
  "formal",
  "casual",
  "frustrated",
  "enthusiastic",
  "neutral",
]);

export const userSentimentEnum = z.enum([
  "positive",
  "negative",
  "neutral",
  "mixed",
]);

// Define the insights schema
export const conversationInsightsSchema = z.object({
  tldr: z
    .string()
    .min(1)
    .describe("A brief summary of the entire conversation (max 2 sentences)"),
  externalQueries: z
    .array(z.string())
    .describe(
      "Questions the user asked not directly related to form questions",
    ),
  userTone: userToneEnum.describe(
    "The overall tone of the user's messages (formal, casual, frustrated, enthusiastic, neutral)",
  ),
  userSentiment: userSentimentEnum.describe(
    "The overall sentiment of the user's messages (positive, negative, neutral, mixed)",
  ),
});

export const respondentMetadataSchema = z
  .object({
    userAgent: userAgentSchema.optional(),
    geoDetails: geoDetailsSchema.optional(),
    submittedAt: z.coerce.date().optional(),
    ipAddress: z.string().optional(),
    insights: conversationInsightsSchema.optional(),
  })
  .partial();

export type RespondentMetadata = z.infer<typeof respondentMetadataSchema>;

// =============================================================
// ============ Conversation collected information/transcript =============================

export const formFieldResponsesSchema = selectFormFieldSchema
  .pick({
    fieldName: true,
    fieldDescription: true,
    fieldConfiguration: true,
    id: true,
  })
  .extend({
    fieldValue: z.string().min(1).nullable(),
  });
export type FormFieldResponses = z.infer<typeof formFieldResponsesSchema>;

export const collectedFilledDataSchema = formFieldResponsesSchema
  .omit({ fieldValue: true })
  .extend({
    fieldValue: z.string().min(1),
  });

export type CollectedFilledData = z.infer<typeof collectedFilledDataSchema>;

export const transcriptSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  fieldName: z.string().optional(),
});

export type Transcript = z.infer<typeof transcriptSchema>;

// =============================================================
// ============ Conversation =============================

export const insertConversationSchema = createInsertSchema(conversation, {
  transcript: transcriptSchema.array(),
  formFieldResponses: formFieldResponsesSchema.array().min(1),
  name: z.string().min(1),
  formOverview: z.string().min(1),
  finishedAt: z.coerce.date().nullable().optional(),
  metaData: respondentMetadataSchema.optional(),
});
export const selectConversationSchema = createSelectSchema(conversation, {
  transcript: transcriptSchema.array(),
  formFieldResponses: formFieldResponsesSchema.array().min(1),
  isInProgress: z.boolean(),
  metaData: respondentMetadataSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export const updateConversationSchema = insertConversationSchema.extend({
  id: z.string().min(1),
  transcript: transcriptSchema.array().min(1),
  isInProgress: z.boolean(),
  finishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
});

export const patchConversationSchema = insertConversationSchema
  .partial()
  .extend({
    id: z.string().min(1),
    finishedAt: z.coerce.date().nullable().optional(),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
  });

export type Conversation = z.infer<typeof selectConversationSchema>;

// =============================================================
// ========== Open AI flow related =============================

export const extraStreamDataSchema = z
  .object({
    conversationId: z.string().min(1),
    formFieldResponses: formFieldResponsesSchema.array().min(1),
    currentField: formFieldResponsesSchema,
    isFormSubmissionFinished: z.boolean(),
    conversationName: z.string().min(1),
  })
  .partial();

export type ExtraStreamData = z.infer<typeof extraStreamDataSchema>;

export const createConversationSchema = selectFormSchema
  .pick({
    id: true,
    organizationId: true,
    overview: true,
  })
  .extend({
    formFields: selectFormFieldSchema
      .pick({
        id: true,
        fieldName: true,
        fieldDescription: true,
        fieldConfiguration: true,
      })
      .array()
      .min(1),
  });

export type CreateConversation = z.infer<typeof createConversationSchema>;

// ======================================================
// ---------------- CONVERSATION SERVICE ----------------
// ======================================================

export const coreConversationSchema = selectConversationSchema.extend({
  form: selectFormSchema,
});

export type CoreConversation = z.infer<typeof coreConversationSchema>;

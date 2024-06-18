import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { conversation } from "./conversation";

export const collectedDataSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.string().min(1).nullable(),
});
export type CollectedData = z.infer<typeof collectedDataSchema>;

export const transcriptSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  fieldName: z.string().optional(),
});

export type Transcript = z.infer<typeof transcriptSchema>;

export const insertConversationSchema = createInsertSchema(conversation, {
  transcript: transcriptSchema.array(),
  collectedData: collectedDataSchema.array().min(1),
  name: z.string().min(1),
  formOverview: z.string().min(1),
});
export const selectConversationSchema = createSelectSchema(conversation, {
  transcript: transcriptSchema.array().min(1),
  collectedData: collectedDataSchema.array().min(1),
  isFinished: z.boolean(),
  isInProgress: z.boolean(),
});
export const updateConversationSchema = insertConversationSchema.extend({
  id: z.string().min(1),
  transcript: transcriptSchema.array().min(1),
  isFinished: z.boolean(),
  isInProgress: z.boolean(),
});

export type Conversation = z.infer<typeof selectConversationSchema>;

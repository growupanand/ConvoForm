import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { conversation, fieldDataSchema } from "./conversation";

export const insertConversationSchema = createInsertSchema(conversation);
export const selectConversationSchema = createSelectSchema(conversation).extend(
  {
    fieldsData: z.array(fieldDataSchema),
  },
);

export type Conversation = z.infer<typeof selectConversationSchema>;

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  fieldName: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;

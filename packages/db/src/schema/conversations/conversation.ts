import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { form } from "../forms/form";
import { CollectedData, Transcript } from "./validation";

export const fieldHavingDataSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.string().min(1),
});
export type FieldHavingData = z.infer<typeof fieldHavingDataSchema>;

export const conversation = pgTable("Conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  name: text("name").notNull(),
  transcript: jsonb("transcript").array().$type<Transcript[]>(),
  collectedData: jsonb("collectedData")
    .array()
    .$type<CollectedData[]>()
    .notNull(),
  formOverview: text("formOverview").notNull(),
  formId: text("formId")
    .notNull()
    .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
  organizationId: text("organizationId").notNull(),
  isFinished: boolean("isFinished").default(false).notNull(),
  isInProgress: boolean("isInProgress").default(false).notNull(),
});

export const conversationRelations = relations(conversation, ({ one }) => ({
  form: one(form, {
    fields: [conversation.formId],
    references: [form.id],
  }),
}));

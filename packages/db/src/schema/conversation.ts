import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { form } from "./form";

export const fieldDataSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.string().nullable(),
});

export type FieldData = z.infer<typeof fieldDataSchema>;

export const conversation = pgTable("Conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  name: text("name").notNull(),
  transcript: jsonb("transcript").array().$type<Record<string, string>[]>(),
  formFieldsData: jsonb("formFieldsData")
    .$type<Record<string, string>>()
    .notNull(),
  fieldsData: jsonb("fieldsData").array().$type<FieldData[]>().notNull(),
  formOverview: text("formOverview").notNull(),
  formId: text("formId")
    .notNull()
    .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
  organizationId: text("organizationId").notNull(),
});

export const conversationRelations = relations(conversation, ({ one }) => ({
  form: one(form, {
    fields: [conversation.formId],
    references: [form.id],
  }),
}));

export const insertConversationSchema = createInsertSchema(conversation);
export const selectConversationSchema = createSelectSchema(conversation).extend(
  {
    fieldsData: z.array(fieldDataSchema),
  },
);

export type Conversation = z.infer<typeof selectConversationSchema>;

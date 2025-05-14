import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";
import type {
  CollectedData,
  RespondentMetadata,
  Transcript,
} from "./validation";

export const conversation = pgTable("Conversation", {
  ...getBaseSchema(),
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
  finishedAt: timestamp("finishedAt"),
  isInProgress: boolean("isInProgress").default(false).notNull(),
  metaData: jsonb("metaData").$type<RespondentMetadata>().notNull().default({}),
});

export const conversationRelations = relations(conversation, ({ one }) => ({
  form: one(form, {
    fields: [conversation.formId],
    references: [form.id],
  }),
}));

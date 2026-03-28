import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";
import type {
  FormFieldResponses,
  RespondentMetadata,
  Transcript,
} from "./validation";

export const conversation = pgTable(
  "Conversation",
  {
    ...getBaseSchema(),
    name: text("name").notNull(),
    transcript: jsonb("transcript").array().$type<Transcript[]>().notNull(),
    formFieldResponses: jsonb("formFieldResponses")
      .array()
      .$type<FormFieldResponses[]>()
      .notNull(),
    formOverview: text("formOverview").notNull(),
    formId: text("formId")
      .notNull()
      .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
    organizationId: text("organizationId").notNull(),
    finishedAt: timestamp("finishedAt"),
    isInProgress: boolean("isInProgress").default(false).notNull(),
    metaData: jsonb("metaData")
      .$type<RespondentMetadata>()
      .notNull()
      .default({}),
    currentFieldId: text("currentFieldId"),
    channelType: text("channelType"),
    channelSenderId: text("channelSenderId"),
  },
  (conversation) => [
    index("idx_conversation_org_form").on(
      conversation.formId,
      conversation.organizationId,
    ),
    index("idx_conversation_org_status").on(
      conversation.organizationId,
      conversation.isInProgress,
    ),
    index("idx_conversation_form_status").on(
      conversation.formId,
      conversation.isInProgress,
    ),
    index("idx_conversation_created_at").on(conversation.createdAt),
    index("idx_conversation_org_created_at").on(
      conversation.organizationId,
      conversation.createdAt,
    ),
    index("idx_conversation_finished_at")
      .on(conversation.finishedAt)
      .where(sql`${conversation.finishedAt} IS NOT NULL`),
    index("idx_conversation_channel_type")
      .on(conversation.channelType)
      .where(sql`${conversation.channelType} IS NOT NULL`),
  ],
);

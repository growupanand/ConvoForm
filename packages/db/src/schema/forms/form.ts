import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { formField } from "../formFields";
import { workspace } from "../workspaces/workspace";

export const form = pgTable("Form", {
  ...getBaseSchema(),
  name: text("name").notNull(),
  overview: text("overview").notNull(),
  welcomeScreenTitle: text("welcomeScreenTitle").notNull(),
  welcomeScreenMessage: text("welcomeScreenMessage").notNull(),
  welcomeScreenCTALabel: text("welcomeScreenCTALabel").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: text("userId").notNull(),
  organizationId: text("organizationId").notNull(),
  isAIGenerated: boolean("isAIGenerated").default(false).notNull(),
  showOrganizationName: boolean("showOrganizationName")
    .default(false)
    .notNull(),
  organizationName: text("organizationName"),
  showOrganizationLogo: boolean("showOrganizationLogo")
    .default(false)
    .notNull(),
  organizationLogoUrl: text("organizationLogoUrl"),
  showCustomEndScreenMessage: boolean("showCustomEndScreenMessage")
    .default(false)
    .notNull(),
  customEndScreenMessage: text("customEndScreenMessage"),
  formFieldsOrders: text("formFieldsOrders")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  endScreenCTAUrl: text("endScreenCTAUrl"),
  endScreenCTALabel: text("endScreenCTALabel"),
});

export const formRelations = relations(form, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [form.workspaceId],
    references: [workspace.id],
  }),
  formFields: many(formField),
}));

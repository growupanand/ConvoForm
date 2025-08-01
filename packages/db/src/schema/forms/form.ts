import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { conversation } from "../conversations";
import { formField } from "../formFields";

export const form = pgTable("Form", {
  ...getBaseSchema(),
  name: text("name").notNull(),
  overview: text("overview").notNull(),
  welcomeScreenTitle: text("welcomeScreenTitle").notNull(),
  welcomeScreenMessage: text("welcomeScreenMessage").notNull(),
  welcomeScreenCTALabel: text("welcomeScreenCTALabel").notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),

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
  googleFormId: text("googleFormId"),
});

export const formRelations = relations(form, ({ many }) => ({
  formFields: many(formField),
  conversations: many(conversation),
}));

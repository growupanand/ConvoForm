import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { formField } from "./formField";
import { workspace } from "./workspace";

export const form = pgTable("Form", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
});

export const formRelations = relations(form, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [form.workspaceId],
    references: [workspace.id],
  }),
  formFields: many(formField),
}));

export const insertFormSchema = createInsertSchema(form);
export const selectFormSchema = createSelectSchema(form);

export type Form = z.infer<typeof selectFormSchema>;

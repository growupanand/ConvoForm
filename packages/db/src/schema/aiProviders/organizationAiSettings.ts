import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { aiProviderCredential } from "./aiProviderCredential";

/**
 * Which BYOK credential and model handles each AI use case for an
 * organization. A row is optional: no row (or a null credential) means
 * ConvoForm's default model is used.
 */
export const organizationAiSettings = pgTable(
  "OrganizationAiSettings",
  {
    ...getBaseSchema(),
    organizationId: text("organizationId").notNull(),
    chatCredentialId: text("chatCredentialId").references(
      () => aiProviderCredential.id,
      { onDelete: "set null" },
    ),
    chatModel: text("chatModel"),
    decisionsCredentialId: text("decisionsCredentialId").references(
      () => aiProviderCredential.id,
      { onDelete: "set null" },
    ),
    decisionsModel: text("decisionsModel"),
    backgroundCredentialId: text("backgroundCredentialId").references(
      () => aiProviderCredential.id,
      { onDelete: "set null" },
    ),
    backgroundModel: text("backgroundModel"),
  },
  (table) => [
    uniqueIndex("uq_organization_ai_settings_org").on(table.organizationId),
  ],
);

export type OrganizationAiSettings = typeof organizationAiSettings.$inferSelect;
export type NewOrganizationAiSettings =
  typeof organizationAiSettings.$inferInsert;

import { index, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import type {
  AiProviderAuditAction,
  AiProviderAuditResult,
  AiProviderId,
} from "./validation";

/**
 * Append-only audit trail for BYOK credential changes.
 *
 * `credentialId` deliberately has no foreign key: deleting a credential must
 * not delete the history of who added, tested or removed it.
 *
 * Secrets and ciphertext are never written here. `errorCode` is a safe code
 * such as `invalid_credentials` or `timeout`.
 */
export const aiProviderAudit = pgTable(
  "AiProviderAudit",
  {
    ...getBaseSchema(),
    organizationId: text("organizationId").notNull(),
    credentialId: text("credentialId"),
    userId: text("userId").notNull(),
    action: text("action").$type<AiProviderAuditAction>().notNull(),
    provider: text("provider").$type<AiProviderId>(),
    result: text("result").$type<AiProviderAuditResult>().notNull(),
    errorCode: text("errorCode"),
  },
  (table) => [
    index("idx_ai_provider_audit_org_created_at").on(
      table.organizationId,
      table.createdAt,
    ),
    index("idx_ai_provider_audit_credential").on(table.credentialId),
  ],
);

export type AiProviderAudit = typeof aiProviderAudit.$inferSelect;
export type NewAiProviderAudit = typeof aiProviderAudit.$inferInsert;

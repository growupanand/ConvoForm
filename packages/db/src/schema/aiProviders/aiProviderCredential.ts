import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import type { AiCredentialStatus, AiProviderId } from "./validation";

/**
 * An organization-owned AI provider credential (BYOK).
 *
 * The secret is never stored in plaintext and never returned by the API:
 *
 * - `encryptedSecret` + `iv` are the AES-256-GCM ciphertext of the secret,
 *   encrypted with a per-credential data key.
 * - `wrappedDataKey` is that data key, sealed with the server-side master key
 *   (`AI_CREDENTIALS_MASTER_KEY`). It is self-describing and carries its own
 *   format version.
 * - `keyVersion` selects the master key version that wrapped the data key.
 * - `last4` is the only part of the secret exposed to clients.
 *
 * A credential becomes `active` only after a successful connection test.
 */
export const aiProviderCredential = pgTable(
  "AiProviderCredential",
  {
    ...getBaseSchema(),
    organizationId: text("organizationId").notNull(),
    provider: text("provider").$type<AiProviderId>().notNull(),
    label: text("label").notNull(),
    /** Only set for the Custom (OpenAI-compatible) provider */
    baseUrl: text("baseUrl"),
    /** Only set for Cloudflare Workers AI */
    accountId: text("accountId"),
    encryptedSecret: text("encryptedSecret").notNull(),
    iv: text("iv").notNull(),
    wrappedDataKey: text("wrappedDataKey").notNull(),
    keyVersion: integer("keyVersion").notNull(),
    last4: text("last4").notNull(),
    status: text("status")
      .$type<AiCredentialStatus>()
      .default("untested")
      .notNull(),
    lastTestedAt: timestamp("lastTestedAt"),
    /** Safe machine-readable result code, never a provider message */
    lastTestResult: text("lastTestResult"),
    createdBy: text("createdBy").notNull(),
  },
  (table) => [
    index("idx_ai_provider_credential_org_status").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export type AiProviderCredential = typeof aiProviderCredential.$inferSelect;
export type NewAiProviderCredential = typeof aiProviderCredential.$inferInsert;

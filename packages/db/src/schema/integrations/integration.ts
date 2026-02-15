import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { formIntegration } from "./formIntegration";

export const integration = pgTable("Integration", {
  ...getBaseSchema(),
  userId: text("userId").notNull(),
  provider: text("provider").notNull(), // 'google_drive', etc.
  encryptedAccessToken: text("encryptedAccessToken").notNull(),
  encryptedRefreshToken: text("encryptedRefreshToken"),
  expiresAt: timestamp("expiresAt"),
});

export const integrationRelations = relations(integration, ({ many }) => ({
  formIntegrations: many(formIntegration),
}));

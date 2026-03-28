import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";

export const integration = pgTable("Integration", {
  ...getBaseSchema(),
  userId: text("userId").notNull(),
  provider: text("provider").notNull(), // 'google_drive', etc.
  encryptedAccessToken: text("encryptedAccessToken").notNull(),
  encryptedRefreshToken: text("encryptedRefreshToken"),
  expiresAt: timestamp("expiresAt"),
});

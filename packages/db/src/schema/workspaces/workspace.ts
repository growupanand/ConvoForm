import { pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";

export const workspace = pgTable("Workspace", {
  ...getBaseSchema(),
  name: text("name").notNull(),
  userId: text("userId"),
  organizationId: text("organizationId").notNull(),
});

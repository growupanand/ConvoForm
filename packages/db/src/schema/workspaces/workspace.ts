import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { getBaseSchema } from "../base";

export const workspace = pgTable("Workspace", {
  ...getBaseSchema(),
  name: text("name").notNull(),
  userId: text("userId"),
  organizationId: text("organizationId").notNull(),
});

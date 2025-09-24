import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

import { getBaseSchema } from "../base";

export const user = pgTable("User", {
  ...getBaseSchema(),
  email: text("email").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  imageUrl: text("imageUrl"),
  userId: text("userId").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

export type User = z.infer<typeof selectUserSchema>;

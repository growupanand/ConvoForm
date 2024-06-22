import { createId } from "@paralleldrive/cuid2";
import { text, timestamp } from "drizzle-orm/pg-core";

// Base schema for every table

export const getBaseSchema = () => ({
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

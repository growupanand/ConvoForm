import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const organization = pgTable("Organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  organizationId: text("organizationId").notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organization);
export const selectOrganizationSchema = createSelectSchema(organization);

export type Organization = z.infer<typeof selectOrganizationSchema>;

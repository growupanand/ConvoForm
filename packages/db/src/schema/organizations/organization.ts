import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

import { getBaseSchema } from "../base";

export const organization = pgTable("Organization", {
  ...getBaseSchema(),
  name: text("name").notNull(),
  slug: text("slug"),
  organizationId: text("organizationId").notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organization);
export const selectOrganizationSchema = createSelectSchema(organization);

export type Organization = z.infer<typeof selectOrganizationSchema>;

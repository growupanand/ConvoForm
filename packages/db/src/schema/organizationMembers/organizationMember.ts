import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { getBaseSchema } from "../base";

export const organizationMember = pgTable("OrganizationMember", {
  ...getBaseSchema(),
  role: text("role").notNull(),
  memberId: text("memberId").notNull(),
  userId: text("userId").notNull(),
  organizationId: text("organizationId").notNull(),
});

export const insertOrganizationMemberSchema =
  createInsertSchema(organizationMember);
export const selectOrganizationMemberSchema =
  createSelectSchema(organizationMember);

export type OrganizationMember = z.infer<typeof selectOrganizationMemberSchema>;

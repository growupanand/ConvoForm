import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const organizationMember = pgTable("OrganizationMember", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { getBaseSchema } from "../base";
import { conversation } from "../conversations/conversation";
import { form } from "../forms/form";
import { organization } from "../organizations/organization";

export const fileUpload = pgTable("FileUpload", {
  ...getBaseSchema(),

  // File metadata
  originalName: text("originalName").notNull(),
  storedName: text("storedName").notNull(),
  storedPath: text("storedPath").notNull(),
  mimeType: text("mimeType").notNull(),
  fileSize: integer("fileSize").notNull(), // in bytes

  // Relations
  organizationId: text("organizationId").notNull(),
  formId: text("formId").notNull(),
  conversationId: text("conversationId"), // nullable - file might be uploaded before conversation is created

  // Expiry and status
  expiresAt: timestamp("expiresAt").notNull(), // 30 days from upload
  isDeleted: boolean("isDeleted").default(false).notNull(),

  // Download tracking
  downloadCount: integer("downloadCount").default(0).notNull(),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
});

export const fileUploadRelations = relations(fileUpload, ({ one }) => ({
  organization: one(organization, {
    fields: [fileUpload.organizationId],
    references: [organization.id],
  }),
  form: one(form, {
    fields: [fileUpload.formId],
    references: [form.id],
  }),
  conversation: one(conversation, {
    fields: [fileUpload.conversationId],
    references: [conversation.id],
  }),
}));

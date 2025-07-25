import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { fileUpload } from "./fileUpload";

/**
 * Schema for inserting a new file upload record
 */
export const insertFileUploadSchema = createInsertSchema(fileUpload, {
  originalName: z.string().min(1).max(255),
  storedName: z.string().min(1).max(255),
  storedPath: z.string().min(1).max(500),
  mimeType: z.enum(["image/jpeg", "image/jpg", "application/pdf"]),
  fileSize: z
    .number()
    .min(1)
    .max(5 * 1024 * 1024), // Max 5MB
  organizationId: z.string().min(1),
  formId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
});

/**
 * Schema for selecting/retrieving file upload records
 */
export const selectFileUploadSchema = createSelectSchema(fileUpload);

/**
 * Schema for updating a file upload record
 */
export const updateFileUploadSchema = insertFileUploadSchema
  .omit({
    organizationId: true,
    formId: true,
  })
  .extend({
    id: z.string().min(1),
  });

/**
 * Schema for patching a file upload record (partial update)
 */
export const patchFileUploadSchema = updateFileUploadSchema.partial().extend({
  id: z.string().min(1),
});

// --- EXPORTED TYPES ---
export type FileUpload = z.infer<typeof selectFileUploadSchema>;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type UpdateFileUpload = z.infer<typeof updateFileUploadSchema>;
export type PatchFileUpload = z.infer<typeof patchFileUploadSchema>;

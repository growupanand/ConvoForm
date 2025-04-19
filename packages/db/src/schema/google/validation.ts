import { z } from "zod";

export const googleDriveFormMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  modifiedTime: z.string().datetime(),
  webViewLink: z.string().url(),
});

export type GoogleDriveFormMeta = z.infer<typeof googleDriveFormMetaSchema>;

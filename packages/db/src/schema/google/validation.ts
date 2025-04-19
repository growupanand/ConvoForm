import { z } from "zod";

/**
 * =====================================================
 * =========== Google Drive API  =================
 */

export const googleDriveFormMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  modifiedTime: z.string().datetime(),
  webViewLink: z.string().url(),
});

export type GoogleDriveFormMeta = z.infer<typeof googleDriveFormMetaSchema>;

/**
 * =====================================================
 * =========== Google Forms API  =================
 */

// Info schema (title and description)
export const googleFormInfoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  documentTitle: z.string().optional(),
});

// Form settings schema
export const googleFormSettingsSchema = z.object({
  quizSettings: z
    .object({
      isQuiz: z.boolean().optional(),
    })
    .optional(),
  collectEmail: z.boolean().optional(),
  limitOneResponsePerUser: z.boolean().optional(),
  confirmationMessage: z.string().optional(),
  allowResponseEdits: z.boolean().optional(),
  acceptingResponses: z.boolean().optional(),
});

// Question types
export const googleFormChoiceOptionSchema = z.object({
  value: z.string(),
  image: z
    .object({
      sourceUri: z.string().optional(),
      altText: z.string().optional(),
    })
    .optional(),
});

// Define reusable enum for Google Form question types
export const googleFormQuestionTypeEnum = [
  "TEXT",
  "PARAGRAPH_TEXT",
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROP_DOWN",
  "SCALE",
  "DATE",
  "TIME",
  "FILE_UPLOAD",
  "GRID",
  "IMAGE",
] as const;

// Simplified schema for various question types
export const googleFormQuestionSchema = z.object({
  questionId: z.string(),
  required: z.boolean().optional(),
});

// Text question schema
export const googleFormTextQuestionSchema = z.object({
  textQuestion: z.object({
    paragraph: z.boolean().optional(),
  }),
});

// Date question schema
export const googleFormDateQuestionSchema = z.object({
  dateQuestion: z.object({
    includeTime: z.boolean().optional(),
    includeYear: z.boolean().optional(),
  }),
});

// Union of all question types
export const googleFormQuestionTypeSchema = z.union([
  googleFormTextQuestionSchema,
  googleFormDateQuestionSchema,
]);

// Combined question schema with base fields and type-specific fields
export const googleFormCompleteQuestionSchema = googleFormQuestionSchema.and(
  googleFormQuestionTypeSchema,
);

// Define each item type separately
const questionItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  questionItem: z.object({
    question: googleFormCompleteQuestionSchema,
  }),
});

const googleFormItemSchema = questionItemSchema;

// Publish settings schema
export const googleFormPublishSettingsSchema = z.object({
  publishState: z.object({
    isPublished: z.boolean(),
    isAcceptingResponses: z.boolean(),
  }),
});

// Main Form schema
export const googleFormSchema = z.object({
  formId: z.string(),
  info: googleFormInfoSchema,
  // settings: googleFormSettingsSchema.optional(),
  items: z.array(questionItemSchema),
  // revisionId: z.string().optional(),
  // responderUri: z.string().optional(),
  // linkedSheetId: z.string().optional(),
  // publishSettings: googleFormPublishSettingsSchema.optional(),
});

export type GoogleFormQuestionType =
  (typeof googleFormQuestionTypeEnum)[number];
export type GoogleFormInfo = z.infer<typeof googleFormInfoSchema>;
export type GoogleFormSettings = z.infer<typeof googleFormSettingsSchema>;
export type GoogleFormQuestionItem = z.infer<typeof questionItemSchema>;
export type GoogleFormQuestion = z.infer<typeof googleFormQuestionSchema>;
export type GoogleFormItem = z.infer<typeof googleFormItemSchema>;
export type GoogleFormPublishSettings = z.infer<
  typeof googleFormPublishSettingsSchema
>;
export type GoogleForm = z.infer<typeof googleFormSchema>;

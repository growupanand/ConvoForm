import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { INPUT_TYPES } from "./constants";
import { formField } from "./formField";

export const inputTypeEnum = z.enum(INPUT_TYPES);
export type InputTypeSchema = z.infer<typeof inputTypeEnum>;

/**
 * ======== SCHEMAS FOR INPUT CONFIGURATION ========
 */

// --- TEXT INPUT CONFIGURATION ---

/**
 * Schema for text input configuration
 * Allows for optional placeholder text and max length
 */
export const textInputConfigSchema = z.object({
  placeholder: z
    .string()
    .optional()
    .describe(
      "Placeholder text shown inside the text input field to guide users",
    ),
  maxLength: z
    .number()
    .optional()
    .describe("Maximum number of characters allowed in the text input"),
  isParagraph: z
    .boolean()
    .optional()
    .describe(
      "Whether to display as a multi-line textarea instead of single-line input",
    ),
});

// --- MULTIPLE CHOICE CONFIGURATION ---

/**
 * Schema for individual choice options within a multiple choice input
 */
const choiceOptionSchema = z.object({
  /** Option value which will be stored in the database on selecting,
   * and also used to display button label
   */
  value: z
    .string()
    .min(1)
    .max(100, "Option label cannot exceed 50 characters")
    .describe("The text label displayed for this choice option"),
  /**
   * Optional flag to indicate that this is an "other" option.
   * If true, the user will be able to enter text in the input field
   */
  isOther: z
    .boolean()
    .optional()
    .describe(
      "Whether this option allows users to enter custom text when selected",
    ),
});

/**
 * Schema for multiple choice input configuration
 * Requires at least 2 options and allows optional multi-select
 */
export const multipleChoiceInputConfigSchema = z.object({
  options: choiceOptionSchema
    .array()
    .min(2, "Must have at least 2 options")
    .describe("Array of choice options displayed to users"),
  allowMultiple: z
    .boolean()
    .optional()
    .describe("Whether users can select multiple options or only one"),
});

// --- DATE PICKER CONFIGURATION ---

/**
 * Schema for date picker input configuration
 * Allows for optional min and max date constraints
 */
export const datePickerInputConfigSchema = z.object({
  minDate: z.coerce
    .date()
    .optional()
    .describe("Earliest selectable date (inclusive)"),
  maxDate: z.coerce
    .date()
    .optional()
    .describe("Latest selectable date (inclusive)"),
  includeTime: z
    .boolean()
    .optional()
    .describe("Whether to include time selection alongside date selection"),
});

// --- RATING INPUT CONFIGURATION ---
export const ratingInputConfigSchema = z.object({
  maxRating: z
    .number()
    .min(3)
    .max(10)
    .optional()
    .default(5)
    .describe("Maximum rating value (e.g., 5 for 5-star rating)"),
  lowLabel: z
    .string()
    .optional()
    .describe(
      "Text label for the lowest rating value (e.g., 'Poor', 'Not Satisfied')",
    ),
  highLabel: z
    .string()
    .optional()
    .describe(
      "Text label for the highest rating value (e.g., 'Excellent', 'Very Satisfied')",
    ),
  requireConfirmation: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to require users to confirm their rating selection"),
  iconType: z
    .enum(["STAR", "HEART", "THUMB_UP"])
    .optional()
    .default("STAR")
    .describe(
      "Type of icon to display for rating (stars, hearts, or thumbs up)",
    ),
});

// --- FILE UPLOAD INPUT CONFIGURATION ---

/**
 * Schema for file upload input configuration
 * Defines limits and allowed file types for beta feature
 */
export const fileUploadInputConfigSchema = z.object({
  /** Optional help text to display to users */
  helpText: z
    .string()
    .optional()
    .describe(
      "Additional instructions or guidance displayed below the file upload field",
    ),
  /** Maximum file size in bytes (default: 5MB) */
  maxFileSize: z
    .number()
    .min(1)
    .max(5 * 1024 * 1024)
    .optional()
    .default(5 * 1024 * 1024)
    .describe("Maximum allowed file size in bytes (5MB = 5,242,880 bytes)"),
  /** Maximum number of files per response (default: 1) */
  maxFiles: z
    .number()
    .min(1)
    .max(1)
    .optional()
    .default(1)
    .describe("Maximum number of files users can upload in a single response"),
  /** Allowed file types (default: images and PDFs only) */
  allowedFileTypes: z
    .array(z.enum(["image/jpeg", "image/jpg", "application/pdf"]))
    .optional()
    .default(["image/jpeg", "image/jpg", "application/pdf"])
    .describe(
      "List of MIME types allowed for upload, only support for 'image/jpeg', 'image/jpg', 'application/pdf'",
    ),
  /** File extensions for display (default: .jpg, .pdf) */
  allowedExtensions: z
    .array(z.string())
    .optional()
    .default([".jpg", ".jpeg", ".pdf"])
    .describe("File extensions shown to users as accepted formats"),
});

/**
 * ======== SCHEMAS FOR FIELD CONFIGURATION ========
 */

/**
 * Schema for text field configuration
 * Combines the input type with its specific configuration
 */
export const textFieldConfigurationSchema = z.object({
  inputType: z
    .literal(inputTypeEnum.enum.text)
    .describe(
      "Type of input field - text input for short or long text responses",
    ),
  inputConfiguration: textInputConfigSchema.describe(
    "Configuration options specific to text input fields",
  ),
});

/**
 * Schema for multiple choice field configuration
 * Combines the input type with its specific configuration
 */
export const multipleChoiceFieldConfigurationSchema = z.object({
  inputType: z
    .literal(inputTypeEnum.enum.multipleChoice)
    .describe(
      "Type of input field - multiple choice for selecting from predefined options",
    ),
  inputConfiguration: multipleChoiceInputConfigSchema.describe(
    "Configuration options specific to multiple choice fields including options and selection behavior",
  ),
});

/**
 * Schema for date picker field configuration
 * Combines the input type with its specific configuration
 */
export const datePickerFieldConfigurationSchema = z.object({
  inputType: z
    .literal(inputTypeEnum.enum.datePicker)
    .describe(
      "Type of input field - date picker for selecting dates and optionally times",
    ),
  inputConfiguration: datePickerInputConfigSchema.describe(
    "Configuration options specific to date picker fields including date constraints",
  ),
});

export const ratingFieldConfigurationSchema = z.object({
  inputType: z
    .literal(inputTypeEnum.enum.rating)
    .describe(
      "Type of input field - rating for collecting feedback or satisfaction scores",
    ),
  inputConfiguration: ratingInputConfigSchema.describe(
    "Configuration options specific to rating fields including scale and labels",
  ),
});

/**
 * Schema for file upload field configuration
 * Combines the input type with its specific configuration
 */
export const fileUploadFieldConfigurationSchema = z
  .object({
    inputType: z
      .literal(inputTypeEnum.enum.fileUpload)
      .describe(
        "Type of input field - file upload for collecting documents or images from users",
      ),
    inputConfiguration: fileUploadInputConfigSchema.describe(
      "Configuration options specific to file upload fields including file type and size restrictions",
    ),
  })
  .describe(
    "Configuration for a file upload field, including file type and size restrictions",
  );

/**
 * Union schema for all field configurations
 * Allows for validation of any supported field type
 */
export const fieldConfigurationSchema = z
  .discriminatedUnion("inputType", [
    textFieldConfigurationSchema,
    multipleChoiceFieldConfigurationSchema,
    datePickerFieldConfigurationSchema,
    ratingFieldConfigurationSchema,
    fileUploadFieldConfigurationSchema,
  ])
  .describe(
    "Complete configuration for a form field including type-specific settings",
  );

// --- FORM FIELD CRUD SCHEMAS ---

/**
 * Schema for inserting a new form field
 * Extends the base form field schema with validation rules
 */
export const insertFormFieldSchema = createInsertSchema(formField, {
  fieldName: z
    .string()
    .min(1)
    .describe("Human-readable name for the form field displayed to users"),
  fieldDescription: z
    .string()
    .min(1)
    .describe(
      "Description or instructions for the field shown to help users understand what information to provide",
    ),
  fieldConfiguration: fieldConfigurationSchema.describe(
    "Complete configuration object defining the field type and its specific settings",
  ),
});

/**
 * Schema for selecting/retrieving form fields
 * Ensures proper typing for the field configuration
 */
export const selectFormFieldSchema = createSelectSchema(formField, {
  fieldConfiguration: fieldConfigurationSchema,
});

/**
 * Schema for updating a form field
 * Omits the formId (which shouldn't be changed) and requires an ID
 */
export const updateFormFieldSchema = insertFormFieldSchema
  .omit({
    formId: true,
  })
  .extend({
    id: z.string().min(1),
  });

/**
 * Schema for patching a form field (partial update)
 * Makes all fields optional except the ID
 */
export const patchFormFieldSchema = updateFormFieldSchema.partial().extend({
  id: z.string().min(1),
});

// --- EXPORTED TYPES ---
export type FormField = z.infer<typeof selectFormFieldSchema>;
export type InsertFormField = z.infer<typeof insertFormFieldSchema>;
export type TextInputConfigSchema = z.infer<typeof textInputConfigSchema>;
export type DatePickerInputConfigSchema = z.infer<
  typeof datePickerInputConfigSchema
>;
export type MultipleChoiceInputConfigSchema = z.infer<
  typeof multipleChoiceInputConfigSchema
>;
export type FieldConfiguration = z.infer<typeof fieldConfigurationSchema>;
export type RatingInputConfigSchema = z.infer<typeof ratingInputConfigSchema>;
export type FileUploadInputConfigSchema = z.infer<
  typeof fileUploadInputConfigSchema
>;

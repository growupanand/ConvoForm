import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import {
  datePickerInputConfigSchema,
  fileUploadFieldConfigurationSchema,
  inputTypeEnum,
  multipleChoiceFieldConfigurationSchema,
  ratingFieldConfigurationSchema,
  textFieldConfigurationSchema,
} from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";

export interface GenerateFormFieldsParams {
  formContext: string;
  maxFields?: number;
  templateType?: string;
  metadata?: LLMAnalyticsMetadata;
}

/**
 * AI-compatible date picker field configuration schema
 *
 * IMPORTANT: We override the original datePickerInputConfigSchema here because
 * the AI SDK's generateObject() function converts Zod schemas to JSON Schema format,
 * but Date objects cannot be represented in JSON Schema and cause the error:
 * "Date cannot be represented in JSON Schema"
 *
 * The original schema uses z.coerce.date() for minDate/maxDate, but for AI generation
 * we need to use string types instead. The post-processing logic later converts
 * any date-only strings (YYYY-MM-DD) to proper ISO timestamps.
 */
export const datePickerFieldConfigurationSchema = z.object({
  inputType: z
    .literal(inputTypeEnum.enum.datePicker)
    .describe(
      "Type of input field - date picker for selecting dates and optionally times",
    ),
  inputConfiguration: datePickerInputConfigSchema
    .extend({
      minDate: z
        .string()
        .optional()
        .describe("Earliest selectable date (inclusive)"),
      maxDate: z
        .string()
        .optional()
        .describe("Latest selectable date (inclusive)"),
    })
    .describe(
      "Configuration options specific to date picker fields including date constraints",
    ),
});

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

/**
 * Schema for a single generated form field that matches the database schema
 */
export const generatedFormFieldSchema = z.object({
  fieldName: z
    .string()
    .describe("Human-readable name for the form field displayed to users"),
  fieldDescription: z
    .string()
    .describe(
      "Description or instructions for the field shown to help users understand what information to provide",
    ),
  fieldConfiguration: fieldConfigurationSchema.describe(
    "Complete configuration object defining the field type and its specific settings",
  ),
});

/**
 * Schema for the complete form fields generation output
 */
export const generateFormFieldsOutputSchema = z.object({
  formName: z.string().describe("Suggested name for the form"),
  formDescription: z
    .string()
    .describe("Brief description of the form's purpose"),
  fields: z
    .array(generatedFormFieldSchema)
    .describe("Array of generated form fields"),
  reasoning: z.string().describe("Explanation of why these fields were chosen"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the generated fields"),
  estimatedCompletionTime: z
    .number()
    .describe("Estimated time to complete form in minutes"),
});

export type GeneratedFormField = z.infer<typeof generatedFormFieldSchema>;
export type GenerateFormFieldsOutput = z.infer<
  typeof generateFormFieldsOutputSchema
>;

/**
 * Generates form fields based on the provided context using OpenAI GPT-4o-mini
 * Uses AI SDK V5 with edge runtime compatibility
 */
export async function generateFormFields(params: GenerateFormFieldsParams) {
  try {
    const maxFields = params.maxFields ?? 8; // Default limit for free tier

    const result = await generateObject({
      model: getModelConfig({
        ...params.metadata,
        actionType: "generateFormFields",
      }),
      temperature: 0.7,
      system: getGenerateFormFieldsSystemPrompt(params, maxFields),
      prompt:
        "Generate appropriate form fields that collect the necessary information with optimal user experience.",
      schema: generateFormFieldsOutputSchema,
    });

    // Post-process to ensure datePicker fields have proper ISO timestamp format
    if (result.object?.fields) {
      result.object.fields = result.object.fields.map((field) => {
        if (field.fieldConfiguration?.inputType === "datePicker") {
          const inputConfig = field.fieldConfiguration.inputConfiguration;

          // Fix minDate if it's in wrong format
          if (
            typeof inputConfig?.minDate === "string" &&
            isDateStringOnly(inputConfig.minDate)
          ) {
            inputConfig.minDate = convertToISOTimestamp(inputConfig.minDate);
          }

          // Fix maxDate if it's in wrong format
          if (
            typeof inputConfig?.maxDate === "string" &&
            isDateStringOnly(inputConfig.maxDate)
          ) {
            inputConfig.maxDate = convertToISOTimestamp(inputConfig.maxDate);
          }
        }
        return field;
      });
    }

    return result;
  } catch (error) {
    // Edge-compatible error handling
    console.error("\n[AI Action error]: generateFormFields\n", error);
    throw error;
  }
}

/**
 * ==================================================================
 * ===================== Helper Functions ===========================
 * ==================================================================
 */

export function getGenerateFormFieldsSystemPrompt(
  params: GenerateFormFieldsParams,
  maxFields: number,
): string {
  return `You are an expert UX designer creating optimal form structures for data collection.

### FORM CONTEXT
${params.formContext}
${params.templateType ? `Template Type: ${params.templateType}` : ""}
Maximum Fields: ${maxFields}

### YOUR TASK
Generate ${maxFields} or fewer form fields that comprehensively cover the form's purpose.

### DESIGN PRINCIPLES
- Choose the most appropriate input type for each field
- Logical field order: basic info → specific questions → optional fields
- Clear, descriptive field names and descriptions
- Only mark essential fields as required
- Realistic options for choice fields (2-8 options)
- Include helpful placeholder text
- Request only necessary information

### SUPPORTED FIELD TYPES

**text**
fieldConfiguration: { inputType: "text", inputConfiguration: { placeholder?: string, maxLength?: number, isParagraph?: boolean } }
- Use isParagraph: true for long text (comments, descriptions)
- Use maxLength for character limits
- Use placeholder for hints

**multipleChoice**
fieldConfiguration: { inputType: "multipleChoice", inputConfiguration: { options: [{ value: string }], allowMultiple?: boolean } }
- Format: [{ value: "Option 1" }, { value: "Option 2" }]
- Set allowMultiple: true for multi-select

**datePicker**
fieldConfiguration: { inputType: "datePicker", inputConfiguration: { minDate?: string, maxDate?: string, includeTime?: boolean } }
- CRITICAL: Use full ISO timestamps ("2025-09-08T18:30:00.000Z"), NOT date-only strings
- Set includeTime: true for time selection

**rating**
fieldConfiguration: { inputType: "rating", inputConfiguration: { maxRating?: number, lowLabel?: string, highLabel?: string, iconType?: "STAR"|"HEART"|"THUMB_UP" } }
- Default maxRating: 5 (range: 3-10)
- Use lowLabel/highLabel for scale descriptions

**fileUpload**
fieldConfiguration: { inputType: "fileUpload", inputConfiguration: { helpText?: string, maxFileSize?: number, allowedFileTypes?: string[], allowedExtensions?: string[] } }
- Default maxFileSize: 5MB (5242880 bytes)
- Default types: ["image/jpeg", "image/jpg", "application/pdf"]

### OUTPUT REQUIREMENTS
- formName: Clear, descriptive form name
- formDescription: Brief purpose explanation
- fields: Array with fieldName, fieldDescription, fieldConfiguration
- reasoning: Brief explanation of field choices
- confidence: 0-1 score
- estimatedCompletionTime: Minutes to complete

Each field MUST use the exact fieldConfiguration structure shown above.`;
}

/**
 * Checks if a date string is in simple "YYYY-MM-DD" format (date only)
 */
function isDateStringOnly(dateString: string): boolean {
  // Check if it matches YYYY-MM-DD format exactly
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateOnlyRegex.test(dateString);
}

/**
 * Converts a date-only string to a full ISO timestamp
 * Input: "2023-10-01"
 * Output: "2023-10-01T00:00:00.000Z"
 */
function convertToISOTimestamp(dateString: string): string {
  try {
    // Parse the date and create a new Date object at midnight UTC
    const date = new Date(`${dateString}T00:00:00.000Z`);
    return date.toISOString();
  } catch (error) {
    // If parsing fails, return the original string
    console.warn(`Failed to convert date string: ${dateString}`, error);
    return dateString;
  }
}

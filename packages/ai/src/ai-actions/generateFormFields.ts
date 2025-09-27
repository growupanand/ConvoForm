import { INPUT_TYPES } from "@convoform/db/src/schema/formFields/constants";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";

export interface GenerateFormFieldsParams {
  formContext: string;
  maxFields?: number;
  templateType?: string;
}

/**
 * Simplified field configuration schema to avoid deep type instantiation issues
 */
const simpleFieldConfigurationSchema = z.object({
  inputType: z.enum(INPUT_TYPES),
  inputConfiguration: z
    .record(z.string(), z.any())
    .describe("Configuration specific to the input type"),
});

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
  fieldConfiguration: simpleFieldConfigurationSchema.describe(
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
      model: getModelConfig(),
      temperature: 0.7,
      system: getGenerateFormFieldsSystemPrompt(params, maxFields),
      prompt:
        "Based on the form context provided, generate appropriate form fields that will collect the necessary information. Focus on creating a user-friendly form that flows naturally.",
      schema: generateFormFieldsOutputSchema,
    });

    // Post-process to ensure datePicker fields have proper ISO timestamp format
    if (result.object?.fields) {
      result.object.fields = result.object.fields.map((field) => {
        if (field.fieldConfiguration?.inputType === "datePicker") {
          const inputConfig = field.fieldConfiguration.inputConfiguration;

          // Fix minDate if it's in wrong format
          if (inputConfig?.minDate && isDateStringOnly(inputConfig.minDate)) {
            inputConfig.minDate = convertToISOTimestamp(inputConfig.minDate);
          }

          // Fix maxDate if it's in wrong format
          if (inputConfig?.maxDate && isDateStringOnly(inputConfig.maxDate)) {
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
  return `You are an expert UX designer and form builder who creates optimal form structures for data collection. Your task is to analyze the provided form context and generate the most appropriate form fields.

Form Context: ${params.formContext}
${params.templateType ? `Template Type: ${params.templateType}` : ""}
Maximum Fields Allowed: ${maxFields}

Instructions:
1. Generate ${maxFields} or fewer fields that comprehensively cover the form's purpose
2. Choose the most appropriate input type for each field based on the data being collected
3. Consider user experience - logical field order and clear labeling
4. Set appropriate validation rules based on the field type
5. Mark fields as required only if they are essential for the form's purpose
6. For choice fields, provide realistic and comprehensive options
7. Include helpful placeholder text where appropriate
8. Consider data privacy and only request necessary information

Supported Input Types and their Configuration Structure:

1. **text** fields:
   - fieldConfiguration: { inputType: "text", inputConfiguration: { placeholder?: string, maxLength?: number, isParagraph?: boolean } }
   - Use isParagraph: true for long text areas (descriptions, comments)
   - Use maxLength for character limits
   - Use placeholder for helpful hints

2. **multipleChoice** fields:
   - fieldConfiguration: { inputType: "multipleChoice", inputConfiguration: { options: [{ value: string }], allowMultiple?: boolean } }
   - Provide 2-8 realistic options in the format [{ value: "Option 1" }, { value: "Option 2" }]
   - Set allowMultiple: true if users can select multiple options

3. **datePicker** fields:
   - fieldConfiguration: { inputType: "datePicker", inputConfiguration: { minDate?: string, maxDate?: string, includeTime?: boolean } }
   - Set includeTime: true if time selection is needed
   - Use minDate/maxDate as full ISO timestamp strings (e.g., "2025-09-08T18:30:00.000Z")
   - IMPORTANT: Always use full ISO timestamp format, not just date strings

4. **rating** fields:
   - fieldConfiguration: { inputType: "rating", inputConfiguration: { maxRating?: number, lowLabel?: string, highLabel?: string, iconType?: "STAR"|"HEART"|"THUMB_UP" } }
   - Default maxRating is 5, can be 3-10
   - Use lowLabel and highLabel for scale descriptions

5. **fileUpload** fields:
   - fieldConfiguration: { inputType: "fileUpload", inputConfiguration: { helpText?: string, maxFileSize?: number, maxFiles?: number, allowedFileTypes?: string[], allowedExtensions?: string[] } }
   - Default maxFileSize: 5MB (5242880 bytes)
   - Default allowedFileTypes: ["image/jpeg", "image/jpg", "application/pdf"]

Form Flow Best Practices:
1. Start with basic identifying information (name, contact)
2. Progress to more specific questions
3. End with optional or supplementary fields
4. Group related fields logically
5. Keep the form as concise as possible while gathering necessary data

Respond with a JSON object containing:
- "formName": A clear, descriptive name for the form
- "formDescription": Brief explanation of the form's purpose
- "fields": Array of field objects with:
  * "fieldName": Human-readable field name
  * "fieldDescription": Detailed description for users
  * "fieldConfiguration": Complete configuration object with inputType and inputConfiguration
- "reasoning": Brief explanation of field choices and structure
- "confidence": Number 0-1 indicating confidence in the generated structure
- "estimatedCompletionTime": Estimated minutes to complete the form

CRITICAL: Each field MUST have the exact fieldConfiguration structure matching the input type as shown above.

Important: Always respond with valid JSON format and ensure all fields have appropriate input types and validation rules.`;
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

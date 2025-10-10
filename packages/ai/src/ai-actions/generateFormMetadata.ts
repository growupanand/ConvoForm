import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";
import type { GeneratedFormField } from "./generateFormFields";

export interface GenerateFormMetadataParams {
  formContext: string;
  selectedFields: GeneratedFormField[];
  organizationName?: string;
  metadata?: LLMAnalyticsMetadata;
}

/**
 * Schema for form metadata generation output
 */
export const generateFormMetadataOutputSchema = z.object({
  formName: z
    .string()
    .describe("Optimized form name based on context and fields"),
  formDescription: z.string().describe("Detailed form description"),
  welcomeScreenTitle: z.string().describe("Welcome screen title"),
  welcomeScreenMessage: z.string().describe("Welcome screen message to users"),
  endingMessage: z.string().describe("Message shown after form completion"),
  estimatedCompletionTime: z
    .number()
    .describe("Estimated completion time in minutes"),
  tags: z.array(z.string()).describe("Relevant tags for the form"),
  reasoning: z.string().describe("Explanation of the generated metadata"),
});

export type GenerateFormMetadataOutput = z.infer<
  typeof generateFormMetadataOutputSchema
>;

/**
 * Generates form metadata (name, description, messages) based on context and selected fields
 * Uses OpenAI GPT-4o-mini with edge runtime compatibility
 */
export async function generateFormMetadata(params: GenerateFormMetadataParams) {
  try {
    return await generateObject({
      model: getModelConfig({
        ...params.metadata,
        actionType: "generateFormMetadata",
      }),
      temperature: 0.6,
      system: getGenerateFormMetadataSystemPrompt(params),
      prompt:
        "Generate comprehensive metadata that makes this form engaging and professional.",
      schema: generateFormMetadataOutputSchema,
    });
  } catch (error) {
    // Edge-compatible error handling
    console.error("\n[AI Action error]: generateFormMetadata\n", error);
    throw error;
  }
}

/**
 * ==================================================================
 * ===================== Helper Functions ===========================
 * ==================================================================
 */

export function getGenerateFormMetadataSystemPrompt(
  params: GenerateFormMetadataParams,
): string {
  const fieldsDescription = params.selectedFields
    .map(
      (field, index) =>
        `${index + 1}. ${field.fieldName} (${field.fieldConfiguration.inputType}) - ${field.fieldDescription}`,
    )
    .join("\n");

  return `You are an expert copywriter creating engaging form experiences.

### FORM CONTEXT
${params.formContext}
${params.organizationName ? `Organization: ${params.organizationName}` : ""}

### FORM FIELDS
${fieldsDescription}

### YOUR TASK
Generate compelling metadata that encourages form completion while maintaining professionalism.

### CONTENT REQUIREMENTS

**formName** (<60 chars)
- Clear, immediately understandable
- Conveys purpose without jargon
- Specific and descriptive

**formDescription** (<200 chars)
- Explains purpose clearly
- Mentions target audience
- Includes important context

**welcomeScreenTitle**
- Warm and professional
- Sets the right tone

**welcomeScreenMessage**
- Puts users at ease
- Sets clear expectations
- Mentions estimated time
- Addresses privacy if relevant

**endingMessage**
- Thanks user for their time
- Explains next steps if applicable
- Provides contact info if relevant
- Leaves positive impression

**estimatedCompletionTime**
- Realistic estimate in minutes based on field complexity

**tags** (3-5 tags)
- Include: form type, industry, purpose
- Use common, searchable terms
- Avoid overly specific tags

**reasoning**
- Brief explanation of your choices

### TONE
Professional yet friendly throughout. Consider user motivation and perspective.`;
}

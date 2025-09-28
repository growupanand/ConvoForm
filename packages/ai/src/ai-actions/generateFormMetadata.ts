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
        "Based on the form context and selected fields, generate comprehensive metadata that will make this form engaging and professional.",
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

  return `You are an expert copywriter and UX designer specializing in creating engaging form experiences. Your task is to generate compelling metadata for a form that will encourage completion while maintaining professionalism.

Form Context: ${params.formContext}
${params.organizationName ? `Organization: ${params.organizationName}` : ""}

Selected Form Fields:
${fieldsDescription}

Instructions:
1. Create a clear, concise form name that immediately conveys the purpose
2. Write an informative description that explains what the form is for
3. Craft a welcoming title and message that puts users at ease
4. Design an ending message that thanks users and sets expectations
5. Provide realistic completion time estimate based on field complexity
6. Generate relevant tags for categorization and searchability
7. Use professional yet friendly tone throughout
8. Consider the user's perspective and motivation for filling the form

Form Name Guidelines:
- Keep it under 60 characters
- Be specific and descriptive
- Avoid jargon or technical terms
- Make it immediately understandable

Description Guidelines:
- Explain the form's purpose clearly
- Mention who should fill it out
- Include any important context or requirements
- Keep it under 200 characters

Welcome Message Guidelines:
- Be warm and professional
- Set clear expectations
- Mention estimated time if helpful
- Address any privacy concerns if relevant

Ending Message Guidelines:
- Thank the user for their time
- Explain what happens next if applicable
- Provide contact information if relevant
- Leave a positive final impression

Tags Guidelines:
- Use 3-5 relevant tags
- Include form type, industry, purpose
- Use common, searchable terms
- Avoid overly specific tags

Respond with a JSON object containing all required metadata fields and a reasoning explanation for your choices.

Important: Always respond with valid JSON format and ensure all text is professional, clear, and engaging.`;
}

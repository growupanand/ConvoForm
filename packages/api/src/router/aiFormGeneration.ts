import {
  type GenerateFormFieldsParams,
  type GenerateFormMetadataParams,
  generateFormFields,
  generateFormFieldsOutputSchema,
  generateFormMetadata,
  generateFormMetadataOutputSchema,
} from "@convoform/ai";
import {
  FEATURE_NAMES,
  PLAN_IDS,
  getAllTemplates,
  getPlanLimit,
} from "@convoform/common";
import { eq } from "@convoform/db";
import { form, formDesign, formField } from "@convoform/db/src/schema";
import {
  DEFAULT_FORM_DESIGN,
  FORM_SECTIONS_ENUMS_VALUES,
} from "@convoform/db/src/schema/formDesigns/constants";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { z } from "zod/v4";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

/**
 * Input schema for generating form fields
 */
const generateFieldsInputSchema = z.object({
  formContext: z
    .string()
    .min(50)
    .max(500)
    .describe("Description of what the form is for"),
  maxFields: z
    .number()
    .min(1)
    .max(15)
    .optional()
    .describe("Maximum number of fields to generate"),
  templateType: z.string().optional().describe("Template type hint"),
});

/**
 * Input schema for creating form from generated fields
 */
const createFormFromFieldsInputSchema = z.object({
  formName: z.string().min(1).max(100),
  formDescription: z.string().min(1).max(500),
  welcomeScreenTitle: z.string().min(1).max(100),
  welcomeScreenMessage: z.string().min(1).max(300),
  endingMessage: z.string().min(1).max(300),
  selectedFields: z
    .array(
      z.object({
        fieldName: z.string(),
        fieldDescription: z.string(),
        fieldConfiguration: z.any(), // Use any for now to avoid complex discriminated union type issues
      }),
    )
    .min(1)
    .max(15),
  organizationId: z.string(),
});

// Form templates are now imported from @convoform/common

/**
 * AI Form Generation Router
 * Handles form field generation and form creation with usage limits
 */
export const aiFormGenerationRouter = createTRPCRouter({
  /**
   * Generate form fields based on context (Public endpoint for demos)
   */
  generateFields: publicProcedure
    .input(generateFieldsInputSchema)
    .output(generateFormFieldsOutputSchema)
    .mutation(async ({ input }) => {
      // Apply default free tier limits for public usage
      const maxFields = Math.min(
        input.maxFields ?? 8,
        getPlanLimit(
          PLAN_IDS.FREE,
          FEATURE_NAMES.AI_FORM_FIELDS_PER_GENERATION,
        ),
      );

      const params: GenerateFormFieldsParams = {
        formContext: input.formContext,
        maxFields,
        templateType: input.templateType,
      };

      try {
        const result = await generateFormFields(params);
        return result.object;
      } catch (error) {
        console.error("Error generating form fields:", error);
        throw new Error(
          "Failed to generate form fields. Please try again with a different description.",
        );
      }
    }),

  /**
   * Generate form fields with user-specific limits (Protected endpoint)
   */
  generateFieldsProtected: authProtectedProcedure
    .input(generateFieldsInputSchema)
    .output(generateFormFieldsOutputSchema)
    .mutation(async ({ input }) => {
      // Check user's current plan and apply limits
      const maxFields = Math.min(
        input.maxFields ?? 8,
        getPlanLimit(
          PLAN_IDS.FREE,
          FEATURE_NAMES.AI_FORM_FIELDS_PER_GENERATION,
        ),
      );

      const params: GenerateFormFieldsParams = {
        formContext: input.formContext,
        maxFields,
        templateType: input.templateType,
      };

      try {
        const result = await generateFormFields(params);
        return result.object;
      } catch (error) {
        console.error("Error generating form fields:", error);
        throw new Error(
          "Failed to generate form fields. Please try again with a different description.",
        );
      }
    }),

  /**
   * Generate form metadata based on selected fields
   */
  generateMetadata: authProtectedProcedure
    .input(
      z.object({
        formContext: z.string().min(1).max(500),
        selectedFields: z.array(z.any()).min(1).max(15), // Use any for flexibility
        organizationName: z.string().optional(),
      }),
    )
    .output(generateFormMetadataOutputSchema)
    .mutation(async ({ input }) => {
      const params: GenerateFormMetadataParams = {
        formContext: input.formContext,
        selectedFields: input.selectedFields,
        organizationName: input.organizationName,
      };

      try {
        const result = await generateFormMetadata(params);
        return result.object;
      } catch (error) {
        console.error("Error generating form metadata:", error);
        throw new Error("Failed to generate form metadata. Please try again.");
      }
    }),

  /**
   * Create a complete form from generated fields and metadata
   */
  createFormFromFields: authProtectedProcedure
    .input(createFormFromFieldsInputSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_CREATE(ctx.userId);

      // Create new form
      const [savedForm] = await ctx.db
        .insert(form)
        .values({
          userId: ctx.userId,
          organizationId: input.organizationId,
          name: input.formName,
          overview: input.formDescription,
          welcomeScreenCTALabel: "Start Form",
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
          isAIGenerated: true,
          isPublished: false, // Let user decide when to publish
          customEndScreenMessage: input.endingMessage,
        })
        .returning();

      if (!savedForm) {
        throw new Error("Failed to create form");
      }

      ctx.analytics.track("form:create", {
        properties: {
          ...savedForm,
          generatedWithAI: true,
        },
        groups: {
          organization: savedForm.organizationId,
        },
      });

      // Create form fields
      const formFieldsData = input.selectedFields.map((field) => ({
        fieldName: field.fieldName,
        fieldDescription: field.fieldDescription,
        fieldConfiguration: field.fieldConfiguration,
        formId: savedForm.id,
      }));

      const savedFormFields = await ctx.db
        .insert(formField)
        .values(formFieldsData)
        .returning();

      if (!savedFormFields) {
        throw new Error("Failed to create form fields");
      }

      // Track field creation
      for (const field of savedFormFields) {
        ctx.analytics.track("formField:create", {
          properties: {
            ...field,
            generatedWithAI: true,
          },
          groups: {
            organization: savedForm.organizationId,
          },
        });
      }

      // Set form fields order
      const formFieldsOrders = savedFormFields.map((field) => field.id);
      await ctx.db
        .update(form)
        .set({ formFieldsOrders })
        .where(eq(form.id, savedForm.id));

      // Create form design configuration
      const savedFormDesigns = FORM_SECTIONS_ENUMS_VALUES.map((screenType) => ({
        formId: savedForm.id,
        organizationId: input.organizationId,
        screenType,
        ...DEFAULT_FORM_DESIGN,
      }));

      await ctx.db.insert(formDesign).values(savedFormDesigns);

      return {
        success: true,
        form: {
          ...savedForm,
          formFields: savedFormFields,
        },
      };
    }),

  /**
   * Get available form templates
   */
  getTemplates: publicProcedure.query(() => {
    return getAllTemplates();
  }),

  /**
   * Get user's AI generation limits (without usage tracking for now)
   */
  getUsageLimits: authProtectedProcedure.query(async () => {
    // Return current plan limits
    return {
      fieldsPerGeneration: {
        limit: getPlanLimit(
          PLAN_IDS.FREE,
          FEATURE_NAMES.AI_FORM_FIELDS_PER_GENERATION,
        ),
      },
      generationsPerMonth: {
        limit: getPlanLimit(
          PLAN_IDS.FREE,
          FEATURE_NAMES.AI_FORM_GENERATIONS_PER_MONTH,
        ),
      },
      planId: PLAN_IDS.FREE, // TODO: Get from user's actual plan
    };
  }),
});

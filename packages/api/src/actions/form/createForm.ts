import type { analytics } from "@convoform/analytics";
import { eq } from "@convoform/db";
import {
  form,
  formDesign,
  formField,
  type insertFormFieldSchema,
  newFormSchema,
} from "@convoform/db/src/schema";
import {
  DEFAULT_FORM_DESIGN,
  FORM_SECTIONS_ENUMS_VALUES,
} from "@convoform/db/src/schema/formDesigns/constants";
import { enforceRateLimit } from "@convoform/rate-limiter";
import { z } from "zod/v4";
import type { TRPCContext } from "../../trpc";

type Analytics = typeof analytics;

const createFormInputSchema = newFormSchema.extend({
  organizationId: z.string(),
});
export type CreateFormInput = z.infer<typeof createFormInputSchema>;

type Context = Pick<TRPCContext, "db"> & {
  userId: string;
  analytics?: Analytics;
};

export async function createForm(ctx: Context, input: CreateFormInput) {
  if (!ctx.userId) {
    throw new Error("User not found");
  }

  await enforceRateLimit.CORE_CREATE(ctx.userId);

  return await ctx.db.transaction(async (tx) => {
    // Create new form
    const [savedForm] = await tx
      .insert(form)
      .values({
        userId: ctx.userId,
        organizationId: input.organizationId,
        name: input.name,
        overview: input.overview,
        welcomeScreenCTALabel: input.welcomeScreenCTALabel,
        welcomeScreenTitle: input.welcomeScreenTitle,
        welcomeScreenMessage: input.welcomeScreenMessage,
        isAIGenerated: input.isAIGenerated,
        isPublished: input.isPublished,
        endScreenCTAUrl: input.endScreenCTAUrl,
        endScreenCTALabel: input.endScreenCTALabel,
        googleFormId: input.googleFormId,
      })
      .returning();
    if (!savedForm) {
      throw new Error("Failed to create form");
    }

    ctx.analytics?.track("form:create", {
      properties: {
        ...savedForm,
        importedFromGoogleForms: Boolean(input.googleFormId),
      },
      groups: {
        organization: savedForm.organizationId,
      },
    });

    // Create new form fields
    const emptyFormField: z.infer<typeof insertFormFieldSchema> = {
      fieldName: "",
      formId: savedForm.id,
      fieldDescription: "",
      fieldConfiguration: {
        inputType: "text",
        inputConfiguration: {},
      },
    };
    const givenFormFields = input.formFields.map((field) => ({
      ...field,
      formId: savedForm.id,
    }));
    const savedFormFields = await tx
      .insert(formField)
      .values(givenFormFields.length > 0 ? givenFormFields : [emptyFormField])
      .returning();

    if (!savedFormFields) {
      throw new Error("Failed to create form fields");
    }

    if (givenFormFields.length > 0) {
      for (const field of savedFormFields) {
        ctx.analytics?.track("formField:create", {
          properties: {
            ...field,
          },
          groups: {
            organization: savedForm.organizationId,
          },
        });
      }
    }

    // Add form fields order
    const formFieldsOrders = savedFormFields.map((field) => field.id);
    await tx
      .update(form)
      .set({ formFieldsOrders })
      .where(eq(form.id, savedForm.id))
      .returning();

    // Create form Design configuration
    const savedFormDesigns = FORM_SECTIONS_ENUMS_VALUES.map((screenType) => ({
      formId: savedForm.id,
      organizationId: input.organizationId,
      screenType,
      ...DEFAULT_FORM_DESIGN,
    }));

    await tx.insert(formDesign).values(savedFormDesigns);

    return {
      ...savedForm,
      formFields: [savedFormFields],
      formDesigns: savedFormDesigns,
    };
  });
}

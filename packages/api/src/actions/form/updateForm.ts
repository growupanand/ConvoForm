import type { analytics } from "@convoform/analytics";
import { eq } from "@convoform/db";
import { form, updateFormSchema } from "@convoform/db/src/schema";
import { enforceRateLimit } from "@convoform/rate-limiter";
import type { z } from "zod/v4";
import type { TRPCContext } from "../../trpc";

type Analytics = typeof analytics;

export const updateFormInputSchema = updateFormSchema.omit({
  formFields: true,
});

type UpdateFormInput = z.infer<typeof updateFormInputSchema>;

type Context = Pick<TRPCContext, "db"> & {
  userId: string;
  analytics?: Analytics;
};

export async function updateForm(ctx: Context, input: UpdateFormInput) {
  if (!ctx.userId) {
    throw new Error("User not found");
  }

  await enforceRateLimit.CORE_EDIT(ctx.userId);

  const [updatedForm] = await ctx.db
    .update(form)
    .set({
      name: input.name,
      overview: input.overview,
      welcomeScreenCTALabel: input.welcomeScreenCTALabel,
      welcomeScreenTitle: input.welcomeScreenTitle,
      welcomeScreenMessage: input.welcomeScreenMessage,
      updatedAt: new Date(),
      formFieldsOrders: input.formFieldsOrders,
    })
    .where(eq(form.id, input.id))
    .returning();

  if (!updatedForm) {
    throw new Error("Failed to update form");
  }

  ctx.analytics?.track("form:update", {
    properties: input,
    groups: {
      organization: updatedForm.organizationId,
    },
  });

  return updatedForm;
}

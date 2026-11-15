import { eq } from "@convoform/db";
import {
  form,
  formDesign,
  insertFormDesignSchema,
  patchFormDesignSchema,
  selectFormDesignSchema,
} from "@convoform/db/src/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { enforceRateLimit } from "@convoform/rate-limiter";
import { isFormOrganizationMember } from "../actions/conversation/isFormOrganizationMember";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";
import type { ActionContext } from "../types/actionContextType";

export const formDesignRouter = createTRPCRouter({
  create: authProtectedProcedure
    .input(insertFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_CREATE(ctx.userId);
      const [result] = await ctx.db
        .insert(formDesign)
        .values({
          formId: input.formId,
          organizationId: input.organizationId,
          screenType: input.screenType,
          backgroundColor: input.backgroundColor,
          fontColor: input.fontColor,
        })
        .returning();

      if (!result) {
        throw new Error("Unable to create formDesign");
      }

      return result;
    }),
  getAll: publicProcedure
    .input(
      selectFormDesignSchema.pick({
        formId: true,
      }),
    )
    .query(async ({ input, ctx }) => {
      await assertFormDesignReadable(ctx, input.formId);

      return await ctx.db.query.formDesign.findMany({
        where: (formDesign, { eq }) => eq(formDesign.formId, input.formId),
        orderBy: (formDesign, { asc }) => [asc(formDesign.createdAt)],
      });
    }),

  getOne: publicProcedure
    .input(
      selectFormDesignSchema
        .pick({
          formId: true,
          id: true,
          screenType: true,
        })
        .partial()
        .required({
          screenType: true,
        }),
    )
    .query(async ({ input, ctx }) => {
      if (!input.id && !input.formId) {
        throw new Error("id or formId is required");
      }

      let formId = input.formId;

      if (input.id) {
        const existingDesign = await ctx.db.query.formDesign.findFirst({
          where: eq(formDesign.id, input.id),
          columns: { formId: true },
        });

        if (!existingDesign) {
          throw formDesignNotFoundError();
        }

        if (formId && formId !== existingDesign.formId) {
          throw formDesignNotFoundError();
        }

        formId = existingDesign.formId;
      }

      // biome-ignore lint/style/noNonNullAssertion: formId is guaranteed above
      await assertFormDesignReadable(ctx, formId!);

      const conditions = [eq(formDesign.screenType, input.screenType)];

      if (input.id) {
        conditions.push(eq(formDesign.id, input.id));
      }

      if (input.formId) {
        conditions.push(eq(formDesign.formId, input.formId));
      }

      return await ctx.db.query.formDesign.findFirst({
        where: (_, { and }) => and(...conditions),
      });
    }),

  delete: authProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.delete(formDesign).where(eq(formDesign.id, input.id));
    }),

  patch: authProtectedProcedure
    .input(patchFormDesignSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceRateLimit.CORE_EDIT(ctx.userId);

      const { id, ...updatedData } = input;
      const [updatedForm] = await ctx.db
        .update(formDesign)
        .set(updatedData)
        .where(eq(formDesign.id, id))
        .returning();

      if (!updatedForm) {
        throw new Error("Failed to update formDesign");
      }

      await ctx.analytics.track("formDesign:update", {
        distinctId: ctx.userId,
        properties: input,
      });
    }),
});

async function assertFormDesignReadable(
  ctx: ActionContext & {
    auth: { userId?: string | null };
  },
  formId: string,
) {
  const targetForm = await ctx.db.query.form.findFirst({
    where: eq(form.id, formId),
    columns: {
      id: true,
      organizationId: true,
      isPublished: true,
    },
  });

  if (!targetForm) {
    throw formDesignNotFoundError();
  }

  if (targetForm.isPublished) {
    return targetForm;
  }

  const isMember = await isFormOrganizationMember(
    targetForm.organizationId,
    ctx.auth.userId,
    ctx,
  );

  if (!isMember) {
    throw formDesignNotFoundError();
  }

  return targetForm;
}

function formDesignNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Form design not found",
  });
}

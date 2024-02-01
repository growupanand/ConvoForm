import { z } from "zod";

import {
  formCreateSchema,
  formPatchSchema,
  formUpdateSchema,
} from "../../../lib/validations/form";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const formRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      formCreateSchema.extend({
        workspaceId: z.string().min(1),
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.form.create({
        data: {
          userId: ctx.userId,
          organizationId: input.organizationId,
          workspaceId: input.workspaceId,
          name: input.name,
          overview: input.overview,
          formField: {
            create: input.formField,
          },
          welcomeScreenCTALabel: input.welcomeScreenCTALabel,
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
        },
      });
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        workspaceId: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.form.findMany({
        where: {
          organizationId: input.organizationId,
          workspaceId: input.workspaceId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  getOne: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.form.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  getOneWithWorkspace: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const form = await ctx.db.form.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!form) {
        throw new Error("Form not found");
      }

      const workspace = await ctx.db.workspace.findFirst({
        where: {
          id: form.workspaceId,
        },
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      return {
        ...form,
        workspace,
      };
    }),

  getOneWithFields: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const form = await ctx.db.form.findFirst({
        where: {
          id: input.id,
        },
        include: {
          formField: true,
        },
      });

      if (!form) {
        return null;
      }

      const { formField, ...restForm } = form;

      return {
        ...restForm,
        formFields: formField,
      };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.form.delete({
        where: {
          id: input.id,
        },
      });
    }),

  patch: protectedProcedure
    .input(
      formPatchSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.form.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  updateForm: protectedProcedure
    .input(
      formUpdateSchema.extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.form.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          overview: input.overview,
          welcomeScreenCTALabel: input.welcomeScreenCTALabel,
          welcomeScreenTitle: input.welcomeScreenTitle,
          welcomeScreenMessage: input.welcomeScreenMessage,
          isPublished: true,
          formField: {
            deleteMany: {},
            create: input.formFields,
          },
        },
      });
    }),

  deleteForm: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.form.delete({
        where: {
          id: input.id,
        },
      });
    }),
});

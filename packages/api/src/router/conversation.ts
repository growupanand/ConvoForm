import {
  conversation,
  count,
  eq,
  fieldDataSchema,
  insertConversationSchema,
} from "@convoform/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const conversationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.auth.orgId) {
        throw new Error("Organization ID is missing");
      }
      return await ctx.db.query.conversation.findMany({
        where: (conversation, { eq, and }) =>
          and(
            eq(conversation.formId, input.formId),
            eq(conversation.organizationId, ctx.auth.orgId!),
          ),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
      });
    }),

  getOne: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.conversation.findFirst({
        where: eq(conversation.id, input.id),
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        organizationId: z.string().min(1),
        name: z.string().min(1),
        transcript: z.array(z.record(z.any())),
        formOverview: z.string().min(1),
        fieldsData: z.array(fieldDataSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let { transcript, fieldsData, formOverview, ...newConversation } =
        insertConversationSchema.parse(input);
      // TODO: If we don't typecast here it will throw type error
      const newTranscript = transcript as Array<Record<string, string>>;
      const newFieldsData = z.array(fieldDataSchema).parse(fieldsData);

      const [result] = await ctx.db
        .insert(conversation)
        .values({
          ...newConversation,
          transcript: newTranscript,
          updatedAt: new Date(),
          formOverview,
          fieldsData: newFieldsData,
        })
        .returning();
      if (!result) {
        throw new Error("Failed to create conversation");
      }

      return result;
    }),

  getResponseCountByOrganization: publicProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({ value: count() })
        .from(conversation)
        .where(eq(conversation.organizationId, input.organizationId));

      return result?.value;
    }),
  getFormResponsesData: protectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.auth.orgId) {
        throw new Error("Organization ID is missing");
      }
      return await ctx.db.query.conversation.findMany({
        where: (conversation, { eq, and }) =>
          and(
            eq(conversation.formId, input.formId),
            eq(conversation.organizationId, ctx.auth.orgId!),
          ),
        columns: {
          id: true,
          fieldsData: true,
          createdAt: true,
          name: true,
        },
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
      });
    }),

  getRecentResponses: protectedProcedure
    .input(
      z.object({
        take: z.number().int().positive(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.auth.orgId) {
        throw new Error("Organization ID is missing");
      }
      return await ctx.db.query.conversation.findMany({
        where: eq(conversation.organizationId, ctx.auth.orgId!),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
        limit: input.take,
        columns: {
          id: true,
          createdAt: true,
          name: true,
          formId: true,
        },
        with: {
          form: {
            columns: {
              name: true,
            },
          },
        },
      });
    }),

  updateFieldsData: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
        fieldsData: z.array(fieldDataSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, fieldsData } = input;
      const newFieldsData = z.array(fieldDataSchema).parse(fieldsData);

      const [result] = await ctx.db
        .update(conversation)
        .set({
          fieldsData: newFieldsData,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, conversationId))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
  updateTranscript: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
        transcript: z.array(z.record(z.any())),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, transcript } = input;
      const newTranscript = transcript as Array<Record<string, string>>;

      const [result] = await ctx.db
        .update(conversation)
        .set({
          transcript: newTranscript,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, conversationId))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),

  updateFinishedStatus: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
        isFinished: z.boolean(),
        conversationName: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, isFinished, conversationName } = input;

      const [result] = await ctx.db
        .update(conversation)
        .set({
          isFinished,
          updatedAt: new Date(),
          name: conversationName,
        })
        .where(eq(conversation.id, conversationId))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
  updateInProgressStatus: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
        isInProgress: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { conversationId, isInProgress } = input;

      const [result] = await ctx.db
        .update(conversation)
        .set({
          isInProgress,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, conversationId))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
});

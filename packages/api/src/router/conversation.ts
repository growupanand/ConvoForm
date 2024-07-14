import { count, eq } from "@convoform/db";
import {
  conversation,
  insertConversationSchema,
  updateConversationSchema,
} from "@convoform/db/src/schema";
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
            // biome-ignore lint/style/noNonNullAssertion: ignored
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
    .input(insertConversationSchema)
    .mutation(async ({ input, ctx }) => {
      const { transcript, collectedData, formOverview, ...newConversation } =
        insertConversationSchema.parse(input);

      const [result] = await ctx.db
        .insert(conversation)
        .values({
          ...newConversation,
          transcript,
          formOverview,
          collectedData,
          updatedAt: new Date(),
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
            // biome-ignore lint/style/noNonNullAssertion: ignored
            eq(conversation.organizationId, ctx.auth.orgId!),
          ),
        columns: {
          id: true,
          collectedData: true,
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
        // biome-ignore lint/style/noNonNullAssertion: ignored
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

  updateCollectedData: publicProcedure
    .input(updateConversationSchema.pick({ id: true, collectedData: true }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .update(conversation)
        .set({
          collectedData: input.collectedData,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, input.id))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
  updateTranscript: publicProcedure
    .input(updateConversationSchema.pick({ id: true, transcript: true }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .update(conversation)
        .set({
          transcript: input.transcript,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, input.id))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),

  updateFinishedStatus: publicProcedure
    .input(
      updateConversationSchema.pick({ id: true, name: true, isFinished: true }),
    )
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .update(conversation)
        .set({
          isFinished: input.isFinished,
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, input.id))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
  updateInProgressStatus: publicProcedure
    .input(
      updateConversationSchema.pick({
        id: true,
        isInProgress: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .update(conversation)
        .set({
          isInProgress: input.isInProgress,
          updatedAt: new Date(),
        })
        .where(eq(conversation.id, input.id))
        .returning();
      if (!result) {
        throw new Error("Failed to update conversation");
      }

      return result;
    }),
});

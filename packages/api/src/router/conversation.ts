import {
  conversation,
  count,
  eq,
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
      return await ctx.db.query.conversation.findMany({
        where: (conversation, { eq }) => eq(conversation.formId, input.formId),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
      });
    }),

  getOne: protectedProcedure
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
        formFieldsData: z.record(z.any()),
        transcript: z.array(z.record(z.any())),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const test = insertConversationSchema.parse(input);
      let { formFieldsData, transcript, ...newConversation } = test;
      // TODO: If we don't typecast here it will throw type error
      const newFormFieldsData = formFieldsData as Record<string, string>;
      const newTranscript = transcript as Array<Record<string, string>>;
      const [result] = await ctx.db
        .insert(conversation)
        .values({
          ...newConversation,
          formFieldsData: newFormFieldsData,
          transcript: newTranscript,
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
      return await ctx.db.query.conversation.findMany({
        where: eq(conversation.formId, input.formId),
        columns: {
          id: true,
          formFieldsData: true,
          createdAt: true,
          name: true,
        },
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
      });
    }),
});

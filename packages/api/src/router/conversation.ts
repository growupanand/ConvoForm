import { count, eq, inArray } from "@convoform/db";
import {
  conversation,
  insertConversationSchema,
  patchConversationSchema,
  restoreDateFields,
  updateConversationSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { protectedProcedure } from "../middlewares/protectedRoutes";
import { publicProcedure } from "../middlewares/publicRoutes";
import { createTRPCRouter } from "../trpc";

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
      const existConversations = await ctx.db.query.conversation.findMany({
        where: (conversation, { eq, and }) =>
          and(
            eq(conversation.formId, input.formId),
            // biome-ignore lint/style/noNonNullAssertion: ignored
            eq(conversation.organizationId, ctx.auth.orgId!),
          ),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
      });

      const existConversationsFormatted = existConversations.map(
        (conversation) => {
          const collectedData = conversation.collectedData.map((collection) => {
            if (collection.fieldConfiguration === undefined) {
              return collection;
            }

            return {
              ...collection,
              fieldConfiguration: restoreDateFields(
                collection.fieldConfiguration,
              ),
            };
          });
          return {
            ...conversation,
            collectedData,
          };
        },
      );

      return existConversationsFormatted;
    }),

  getOne: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const existConversation = await ctx.db.query.conversation.findFirst({
        where: eq(conversation.id, input.id),
      });

      if (!existConversation) {
        return undefined;
      }

      const collectedData = existConversation.collectedData.map(
        (collection) => {
          if (collection.fieldConfiguration === undefined) {
            return collection;
          }

          return {
            ...collection,
            fieldConfiguration: restoreDateFields(
              collection.fieldConfiguration,
            ),
          };
        },
      );

      return {
        ...existConversation,
        collectedData,
      };
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

      const parsedCollectedData = collectedData.map((collection) => {
        if (collection.fieldConfiguration === undefined) {
          return collection;
        }

        return {
          ...collection,
          fieldConfiguration: restoreDateFields(collection.fieldConfiguration),
        };
      });

      return {
        ...result,
        collectedData: parsedCollectedData,
      };
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

  getCountByFormIds: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        formIds: z.array(z.string().min(1)),
      }),
    )
    .query(async ({ input, ctx }) => {
      const formsWithConversations = await ctx.db.query.form.findMany({
        where: (form, { eq, and }) =>
          and(
            eq(form.organizationId, input.organizationId),
            inArray(form.id, input.formIds),
          ),
        columns: {
          id: true,
        },
        with: {
          conversations: {
            columns: {
              id: true,
            },
          },
        },
        orderBy: (form, { asc }) => [asc(form.createdAt)],
      });

      return formsWithConversations.map((form) => {
        return {
          id: form.id,
          conversationCount: form.conversations.length,
        };
      });
    }),
  // Patch partial form
  patch: publicProcedure
    .input(patchConversationSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updatedData } = input;
      const [updatedConversation] = await ctx.db
        .update(conversation)
        .set({
          ...updatedData,
        })
        .where(eq(conversation.id, id))
        .returning();

      if (!updatedConversation) {
        throw new Error("Failed to update conversation");
      }
    }),

  stats: publicProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const formId = input.formId;

      const result = await ctx.db.query.conversation.findMany({
        columns: {
          id: true,
          isFinished: true,
          isInProgress: true,
        },
        where: (conversation, { eq }) => eq(conversation.formId, formId),
      });

      return {
        totalCount: result.length,
        finishedTotalCount: result.filter(
          (conversation) => conversation.isFinished,
        ).length,
        partialTotalCount: result.filter(
          (conversation) =>
            !conversation.isFinished && !conversation.isInProgress,
        ).length,
        liveTotalCount: result.filter(
          (conversation) => conversation.isInProgress,
        ).length,
      };
    }),
});

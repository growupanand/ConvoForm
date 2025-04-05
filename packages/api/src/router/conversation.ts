import { and, count, eq, inArray } from "@convoform/db";
import {
  conversation,
  insertConversationSchema,
  patchConversationSchema,
  restoreDateFields,
  updateConversationSchema,
} from "@convoform/db/src/schema";
import { z } from "zod";

import { analytics } from "@convoform/analytics";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

export const conversationRouter = createTRPCRouter({
  getAll: authProtectedProcedure
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

      analytics.track("conversation:create", {
        properties: {
          ...result,
        },
      });

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

  getCountByOrganizationId: publicProcedure
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
  getFormResponsesData: authProtectedProcedure
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

  getRecentResponses: authProtectedProcedure
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

  getCountByFormIds: authProtectedProcedure
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

      analytics.track("conversation:update", {
        properties: input,
      });
    }),

  stats: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const formId = input.formId;

      const filters = [eq(conversation.organizationId, ctx.orgId)];

      if (formId) {
        filters.push(eq(conversation.formId, formId));
      }

      const conversations = await ctx.db.query.conversation.findMany({
        columns: {
          id: true,
          isFinished: true,
          isInProgress: true,
        },
        where: and(...filters),
      });

      // Calculate all counts in a single pass through the array
      const stats = conversations.reduce(
        (acc, conv) => {
          acc.totalCount++;

          if (conv.isFinished) {
            acc.finishedTotalCount++;
          } else if (conv.isInProgress) {
            acc.liveTotalCount++;
          } else {
            acc.partialTotalCount++;
          }

          return acc;
        },
        {
          totalCount: 0,
          finishedTotalCount: 0,
          partialTotalCount: 0,
          liveTotalCount: 0,
        },
      );

      return stats;
    }),
  multiChoiceStats: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const formId = input.formId;

      // Get all conversations for this form
      const conversations = await ctx.db.query.conversation.findMany({
        where: and(
          eq(conversation.organizationId, ctx.orgId),
          eq(conversation.formId, formId),
        ),
        columns: {
          collectedData: true,
        },
      });

      // Create a map to store stats for each field and option
      const fieldStats: Record<
        string,
        {
          fieldName: string;
          options: Record<string, number>;
          total: number;
        }
      > = {};

      // Process all conversations to count options for multiple choice fields
      for (const conv of conversations) {
        if (conv.collectedData?.length) {
          for (const field of conv.collectedData) {
            // Check if this is a multiple choice field with a value
            if (
              field.fieldConfiguration?.inputType === "multipleChoice" &&
              field.fieldValue
            ) {
              const fieldName = field.fieldName;
              const selectedOption = field.fieldValue;

              // Initialize field in the stats if it doesn't exist
              if (!fieldStats[fieldName]) {
                fieldStats[fieldName] = {
                  fieldName: field.fieldName,
                  options: {},
                  total: 0,
                };
              }

              // Initialize option counter if it doesn't exist
              if (!fieldStats[fieldName].options[selectedOption]) {
                fieldStats[fieldName].options[selectedOption] = 0;
              }

              // Increment the counter for this option
              fieldStats[fieldName].options[selectedOption]++;
              fieldStats[fieldName].total++;
            }
          }
        }
      }

      // Format the results with percentages
      const results = Object.values(fieldStats).map((field) => {
        const optionsWithStats = Object.entries(field.options).map(
          ([option, count]) => ({
            option,
            count,
            percentage: Math.round((count / field.total) * 100),
          }),
        );

        return {
          fieldName: field.fieldName,
          totalResponses: field.total,
          options: optionsWithStats,
        };
      });

      return results;
    }),
});

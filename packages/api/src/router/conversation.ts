import { and, count, eq, inArray } from "@convoform/db";
import {
  conversation,
  form,
  insertConversationSchema,
  patchConversationSchema,
  respondentMetadataSchema,
  restoreDateFields,
  updateConversationSchema,
} from "@convoform/db/src/schema";
import { geolocation } from "@vercel/functions";
import { z } from "zod";

import { analytics } from "@convoform/analytics";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { generateConversationInsights } from "../lib/ai";
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
          const formFieldResponses = conversation.formFieldResponses.map(
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
            ...conversation,
            formFieldResponses,
            transcript: conversation.transcript ?? [],
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

      const formFieldResponses = existConversation.formFieldResponses.map(
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
        formFieldResponses,
      };
    }),

  create: publicProcedure
    .input(insertConversationSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        transcript,
        formFieldResponses,
        formOverview,
        ...newConversation
      } = insertConversationSchema.parse(input);

      const userAgentInformation = userAgent({ headers: await headers() });
      const geoInformation = geolocation({ headers: await headers() });

      const metaData = await respondentMetadataSchema.parseAsync({
        userAgent: userAgentInformation,
        geoDetails: geoInformation,
        ...input.metaData,
      });

      const [result] = await ctx.db
        .insert(conversation)
        .values({
          ...newConversation,
          transcript,
          formOverview,
          formFieldResponses,
          updatedAt: new Date(),
          metaData,
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

      const parsedFormFieldResponses = formFieldResponses.map((collection) => {
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
        formFieldResponses: parsedFormFieldResponses,
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
  getOrganizationFormsCountByFormId: publicProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Count all conversations for all forms in the same organization as the input form
      const [result] = await ctx.db
        .select({ value: count() })
        .from(conversation)
        .innerJoin(form, eq(conversation.formId, form.id))
        .where(
          eq(
            form.organizationId,
            ctx.db
              .select({ organizationId: form.organizationId })
              .from(form)
              .where(eq(form.id, input.formId)),
          ),
        );

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

  updateFormFieldResponses: publicProcedure
    .input(
      updateConversationSchema.pick({ id: true, formFieldResponses: true }),
    )
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .update(conversation)
        .set({
          formFieldResponses: input.formFieldResponses,
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
      const {
        id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...updatedData
      } = input;
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
          finishedAt: true,
          isInProgress: true,
          createdAt: true,
          formFieldResponses: true,
        },
        where: and(...filters),
      });

      // Calculate all counts in a single pass through the array
      const stats = conversations.reduce(
        (acc, conv) => {
          acc.totalCount++;

          if (conv.finishedAt) {
            acc.finishedTotalCount++;

            // Calculate the finish time for this conversation (in milliseconds)
            const finishTime =
              new Date(conv.finishedAt).getTime() -
              new Date(conv.createdAt).getTime();
            acc.totalFinishTime += finishTime;
          } else if (conv.isInProgress) {
            acc.liveTotalCount++;
          } else {
            acc.partialTotalCount++;
          }

          // Check for bounce - conversations with no collected data
          const hasNoFormFieldResponses =
            !conv.formFieldResponses ||
            conv.formFieldResponses.filter((i) => i.fieldValue !== null)
              .length === 0;

          if (hasNoFormFieldResponses) {
            acc.bouncedCount++;
          }

          return acc;
        },
        {
          totalCount: 0,
          finishedTotalCount: 0,
          partialTotalCount: 0,
          liveTotalCount: 0,
          totalFinishTime: 0,
          bouncedCount: 0,
        },
      );

      // Calculate average finish time if there are any finished conversations
      let averageFinishTimeMs = 0;
      if (stats.finishedTotalCount > 0) {
        averageFinishTimeMs = Math.floor(
          stats.totalFinishTime / stats.finishedTotalCount,
        );
      }

      // Calculate bounce rate
      const bounceRate =
        stats.totalCount > 0
          ? Math.round((stats.bouncedCount / stats.totalCount) * 100)
          : 0;

      return { ...stats, averageFinishTimeMs, bounceRate };
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
          formFieldResponses: true,
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
        if (conv.formFieldResponses?.length) {
          for (const field of conv.formFieldResponses) {
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
  ratingStats: orgProtectedProcedure
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
          formFieldResponses: true,
        },
      });

      // Create a map to store stats for each rating field
      const fieldStats: Record<
        string,
        {
          fieldName: string;
          ratings: number[];
          totalRatings: number;
          maxRating: number;
        }
      > = {};

      // Process all conversations to collect rating data
      for (const conv of conversations) {
        if (conv.formFieldResponses?.length) {
          for (const field of conv.formFieldResponses) {
            // Check if this is a rating field with a value
            if (
              field.fieldConfiguration?.inputType === "rating" &&
              field.fieldValue
            ) {
              const fieldName = field.fieldName;
              const ratingValue = Number.parseInt(field.fieldValue, 10);

              if (Number.isNaN(ratingValue)) continue;

              // Initialize field in the stats if it doesn't exist
              if (!fieldStats[fieldName]) {
                const maxRating =
                  field.fieldConfiguration.inputConfiguration?.maxRating || 5;
                fieldStats[fieldName] = {
                  fieldName: field.fieldName,
                  ratings: [],
                  totalRatings: 0,
                  maxRating,
                };
              }

              // Add this rating to the array
              fieldStats[fieldName].ratings.push(ratingValue);
              fieldStats[fieldName].totalRatings++;
            }
          }
        }
      }

      // Calculate statistics for each field
      const results = Object.values(fieldStats).map((field) => {
        // Calculate average rating
        const averageRating =
          field.ratings.length > 0
            ? (
                field.ratings.reduce((sum, rating) => sum + rating, 0) /
                field.ratings.length
              ).toFixed(1)
            : "0";

        // Calculate distribution of ratings
        const distribution = Array.from(
          { length: field.maxRating },
          (_, i) => i + 1,
        ).map((ratingValue) => {
          const count = field.ratings.filter((r) => r === ratingValue).length;
          return {
            rating: ratingValue,
            count,
            percentage:
              field.totalRatings > 0
                ? Math.round((count / field.totalRatings) * 100)
                : 0,
          };
        });

        return {
          fieldName: field.fieldName,
          totalResponses: field.totalRatings,
          averageRating,
          maxRating: field.maxRating,
          distribution,
        };
      });

      return results;
    }),
  getDemoFormResponses: publicProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const existConversations = await ctx.db.query.conversation.findMany({
        where: (conversation, { eq }) => eq(conversation.formId, input.formId),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
        limit: 20, // Limit to 20 most recent
      });

      const existConversationsFormatted = existConversations.map(
        (conversation) => {
          const formFieldResponses = conversation.formFieldResponses.map(
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
            ...conversation,
            formFieldResponses,
            transcript: conversation.transcript ?? [],
          };
        },
      );

      return existConversationsFormatted;
    }),
  generateInsights: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch the conversation
      const conversationData = await ctx.db.query.conversation.findFirst({
        where: eq(conversation.id, input.conversationId),
      });

      if (!conversationData) {
        throw new Error(
          `Conversation with ID ${input.conversationId} not found`,
        );
      }

      // Check if conversation is completed
      if (
        conversationData.isInProgress ||
        conversationData.transcript === null
      ) {
        throw new Error("Cannot generate insights for incomplete conversation");
      }

      // Generate insights
      const insights = await generateConversationInsights(
        conversationData.transcript,
        conversationData.formFieldResponses,
      );

      // Update conversation with insights
      const [updatedConversation] = await ctx.db
        .update(conversation)
        .set({
          metaData: {
            ...conversationData.metaData,
            insights,
          },
        })
        .where(eq(conversation.id, input.conversationId))
        .returning();

      if (!updatedConversation) {
        throw new Error("Failed to update conversation with insights");
      }

      return { success: true, insights };
    }),
});

import { and, count, eq, inArray, sql } from "@convoform/db";
import {
  conversation,
  form,
  insertConversationSchema,
  patchConversationSchema,
  restoreDateFields,
  updateConversationSchema,
} from "@convoform/db/src/schema";
import { z } from "zod/v4";

import {
  createConversation,
  getOneConversation,
  patchConversation,
} from "../actions/conversation";
import { getOrganizationFormsCountByFormId } from "../actions/conversation/getOrganizationFormsCountByFormId";
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
      return await getOneConversation(input.id, ctx);
    }),

  create: publicProcedure
    .input(insertConversationSchema)
    .mutation(async ({ input, ctx }) => {
      return await createConversation(input, ctx);
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
      return await getOrganizationFormsCountByFormId(input.formId, ctx);
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
      const results = await ctx.db
        .select({
          id: form.id,
          conversationCount: count(conversation.id),
        })
        .from(form)
        .leftJoin(conversation, eq(form.id, conversation.formId))
        .where(
          and(
            eq(form.organizationId, input.organizationId),
            inArray(form.id, input.formIds),
          ),
        )
        .groupBy(form.id)
        .orderBy(form.createdAt);

      return results.map((row) => ({
        id: row.id,
        conversationCount: Number(row.conversationCount),
      }));
    }),
  // Patch partial form
  patch: publicProcedure
    .input(patchConversationSchema)
    .mutation(async ({ input, ctx }) => {
      return await patchConversation(input, ctx);
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

      const [statsResult] = await ctx.db
        .select({
          totalCount: count(),
          finishedTotalCount: count(conversation.finishedAt),
          liveTotalCount:
            sql<number>`count(*) filter (where ${conversation.finishedAt} is null and ${conversation.isInProgress} = true)`.mapWith(
              Number,
            ),
          partialTotalCount:
            sql<number>`count(*) filter (where ${conversation.finishedAt} is null and ${conversation.isInProgress} = false)`.mapWith(
              Number,
            ),
          totalFinishTime:
            sql<number>`sum(extract(epoch from (${conversation.finishedAt} - ${conversation.createdAt})) * 1000) filter (where ${conversation.finishedAt} is not null)`.mapWith(
              Number,
            ),
          bouncedCount:
            sql<number>`count(*) filter (where cardinality(${conversation.formFieldResponses}) = 0 or not exists (select 1 from unnest(${conversation.formFieldResponses}) as resp where resp->>'fieldValue' is not null))`.mapWith(
              Number,
            ),
        })
        .from(conversation)
        .where(and(...filters));

      if (!statsResult) {
        return {
          totalCount: 0,
          finishedTotalCount: 0,
          partialTotalCount: 0,
          liveTotalCount: 0,
          totalFinishTime: 0,
          bouncedCount: 0,
          averageFinishTimeMs: 0,
          bounceRate: 0,
        };
      }

      const stats = {
        totalCount: Number(statsResult.totalCount),
        finishedTotalCount: Number(statsResult.finishedTotalCount),
        partialTotalCount: Number(statsResult.partialTotalCount),
        liveTotalCount: Number(statsResult.liveTotalCount),
        totalFinishTime: Number(statsResult.totalFinishTime),
        bouncedCount: Number(statsResult.bouncedCount),
      };

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
      const results = await ctx.db
        .select({
          fieldName: sql<string>`resp->>'fieldName'`.as("fieldName"),
          option: sql<string>`resp->>'fieldValue'`.as("option"),
          count: count().as("count"),
        })
        .from(conversation)
        .innerJoin(
          sql`unnest(${conversation.formFieldResponses}) as resp`,
          sql`true`,
        )
        .where(
          and(
            eq(conversation.organizationId, ctx.orgId),
            eq(conversation.formId, input.formId),
            sql`resp->'fieldConfiguration'->>'inputType' = 'multipleChoice'`,
            sql`resp->>'fieldValue' is not null`,
          ),
        )
        .groupBy(sql`resp->>'fieldName'`, sql`resp->>'fieldValue'`);

      const fieldStats: Record<
        string,
        {
          fieldName: string;
          options: { option: string; count: number }[];
          total: number;
        }
      > = {};

      for (const row of results) {
        if (!fieldStats[row.fieldName]) {
          fieldStats[row.fieldName] = {
            fieldName: row.fieldName,
            options: [],
            total: 0,
          };
        }
        const countValue = Number(row.count);
        fieldStats[row.fieldName].options.push({
          option: row.option,
          count: countValue,
        });
        fieldStats[row.fieldName].total += countValue;
      }

      return Object.values(fieldStats).map((field) => ({
        fieldName: field.fieldName,
        totalResponses: field.total,
        options: field.options.map((opt) => ({
          ...opt,
          percentage: Math.round((opt.count / field.total) * 100),
        })),
      }));
    }),
  ratingStats: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const results = await ctx.db
        .select({
          fieldName: sql<string>`resp->>'fieldName'`.as("fieldName"),
          rating: sql<string>`resp->>'fieldValue'`.as("rating"),
          count: count().as("count"),
          maxRating:
            sql<number>`coalesce((resp->'fieldConfiguration'->'inputConfiguration'->>'maxRating')::int, 5)`.as(
              "maxRating",
            ),
        })
        .from(conversation)
        .innerJoin(
          sql`unnest(${conversation.formFieldResponses}) as resp`,
          sql`true`,
        )
        .where(
          and(
            eq(conversation.organizationId, ctx.orgId),
            eq(conversation.formId, input.formId),
            sql`resp->'fieldConfiguration'->>'inputType' = 'rating'`,
            sql`resp->>'fieldValue' is not null`,
          ),
        )
        .groupBy(
          sql`resp->>'fieldName'`,
          sql`resp->>'fieldValue'`,
          sql`resp->'fieldConfiguration'->'inputConfiguration'->>'maxRating'`,
        );

      const fieldStats: Record<
        string,
        {
          fieldName: string;
          ratings: { rating: number; count: number }[];
          totalRatings: number;
          maxRating: number;
          sumRatings: number;
        }
      > = {};

      for (const row of results) {
        if (!fieldStats[row.fieldName]) {
          fieldStats[row.fieldName] = {
            fieldName: row.fieldName,
            ratings: [],
            totalRatings: 0,
            maxRating: Number(row.maxRating),
            sumRatings: 0,
          };
        }
        const ratingValue = Number.parseInt(row.rating, 10);
        const countValue = Number(row.count);
        if (!Number.isNaN(ratingValue)) {
          fieldStats[row.fieldName].ratings.push({
            rating: ratingValue,
            count: countValue,
          });
          fieldStats[row.fieldName].totalRatings += countValue;
          fieldStats[row.fieldName].sumRatings += ratingValue * countValue;
        }
      }

      return Object.values(fieldStats).map((field) => {
        const averageRating =
          field.totalRatings > 0
            ? (field.sumRatings / field.totalRatings).toFixed(1)
            : "0";

        const distribution = Array.from(
          { length: field.maxRating },
          (_, i) => i + 1,
        ).map((ratingValue) => {
          const ratingData = field.ratings.find(
            (r) => r.rating === ratingValue,
          );
          const countValue = ratingData?.count ?? 0;
          return {
            rating: ratingValue,
            count: countValue,
            percentage:
              field.totalRatings > 0
                ? Math.round((countValue / field.totalRatings) * 100)
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

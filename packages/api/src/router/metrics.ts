import { and, count, eq } from "@convoform/db";
import { conversation, form } from "@convoform/db/src/schema";
import { z } from "zod";

import { getCurrentMonthDaysArray } from "../lib/utils";
import { protectedProcedure } from "../middlewares/protectedRoutes";
import { publicProcedure } from "../middlewares/publicRoutes";
import { createTRPCRouter } from "../trpc";

export const metricsRouter = createTRPCRouter({
  getFormMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({ value: count() })
        .from(form)
        .where(eq(form.organizationId, input.organizationId));

      const totalCount = result?.value;

      const formCountsDataDayWise = {} as Record<string, any>;
      const monthFirstDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const forms = await ctx.db.query.form.findMany({
        where: (form, { eq, and, gte }) =>
          and(
            eq(form.organizationId, input.organizationId),
            gte(form.createdAt, monthFirstDate),
          ),
        orderBy: (form, { desc }) => [desc(form.createdAt)],
        columns: {
          createdAt: true,
        },
      });

      const currentMonthDaysArray = getCurrentMonthDaysArray();
      for (const day of currentMonthDaysArray) {
        formCountsDataDayWise[day] = 0;
      }
      for (const element of forms) {
        const form = element;
        const formCreatedAtDay = form.createdAt.getDate();
        formCountsDataDayWise[formCreatedAtDay] += 1;
      }
      const formCountDataArray = Object.entries(formCountsDataDayWise).map(
        ([name, value]) => ({
          name,
          count: value,
        }),
      );

      let lastCreatedAt =
        forms.length > 0 && forms[0] ? forms[0].createdAt : null;

      // If there is no form created in the lastDaysCount days,
      // then we will look into database for the last created form
      if (lastCreatedAt === null) {
        const lastForm = await ctx.db.query.form.findFirst({
          where: eq(form.organizationId, input.organizationId),
          orderBy: (form, { desc }) => [desc(form.createdAt)],
          columns: {
            createdAt: true,
          },
        });
        lastCreatedAt = lastForm?.createdAt ?? null;
      }

      return {
        totalCount,
        data: formCountDataArray,
        lastCreatedAt,
      };
    }),

  getConversationMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1).optional(),
        formId: z.string().min(1).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input.organizationId && !input.formId) {
        throw new Error("Either organizationId or formId is required");
      }

      const [result] = await ctx.db
        .select({ value: count() })
        .from(conversation)
        .where(
          and(
            input.organizationId
              ? eq(conversation.organizationId, input.organizationId)
              : undefined,
            input.formId ? eq(conversation.formId, input.formId) : undefined,
          ),
        );
      const totalCount = result?.value ?? 0;

      const conversationCountsDataDayWise = {} as Record<string, any>;
      const monthFirstDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const conversations = await ctx.db.query.conversation.findMany({
        where: (conversation, { eq, and, gte }) =>
          and(
            gte(conversation.createdAt, monthFirstDate),
            input.organizationId
              ? eq(conversation.organizationId, input.organizationId)
              : undefined,
            input.formId ? eq(conversation.formId, input.formId) : undefined,
          ),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
        columns: {
          createdAt: true,
        },
      });

      const currentMonthDaysArray = getCurrentMonthDaysArray();
      for (const day of currentMonthDaysArray) {
        conversationCountsDataDayWise[day] = 0;
      }
      for (const element of conversations) {
        const conversation = element;
        const conversationCreatedAtDay = conversation.createdAt.getDate();
        conversationCountsDataDayWise[conversationCreatedAtDay] += 1;
      }
      const conversationCountDataArray = Object.entries(
        conversationCountsDataDayWise,
      ).map(([name, value]) => ({
        name,
        count: value,
      }));

      let lastCreatedAt =
        conversations.length > 0 && conversations[0]
          ? conversations[0].createdAt
          : null;

      // If there is no conversation created in the lastDaysCount days,
      // then we will look into database for the last created conversation
      if (lastCreatedAt === null) {
        const lastConversation = await ctx.db.query.conversation.findFirst({
          where: and(
            input.organizationId
              ? eq(conversation.organizationId, input.organizationId)
              : undefined,
            input.formId ? eq(conversation.formId, input.formId) : undefined,
          ),
          orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
          columns: {
            createdAt: true,
          },
        });
        lastCreatedAt = lastConversation?.createdAt ?? null;
      }

      return {
        totalCount,
        data: conversationCountDataArray,
        lastCreatedAt,
      };
    }),

  getResponsesCount: publicProcedure
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

      return result?.value ?? 0;
    }),
});

import { conversation, count, eq, form } from "@convoform/db";
import { z } from "zod";

import { getCurrentMonthDaysArray, getLastDaysDate } from "../lib/utils";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const metricsRouter = createTRPCRouter({
  getFormMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        lastDaysCount: z.number().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({ value: count() })
        .from(form)
        .where(eq(form.organizationId, input.organizationId));

      const totalCount = result?.value;

      const formCountsDataDayWise = {} as Record<string, any>;

      const lastDaysDate = getLastDaysDate(input.lastDaysCount);
      const forms = await ctx.db.query.form.findMany({
        where: (form, { eq, and, gte }) =>
          and(
            eq(form.organizationId, input.organizationId),
            gte(form.createdAt, lastDaysDate),
          ),
        orderBy: (form, { desc }) => [desc(form.createdAt)],
        columns: {
          createdAt: true,
        },
      });

      const currentMonthDaysArray = getCurrentMonthDaysArray();
      currentMonthDaysArray.forEach((day) => {
        formCountsDataDayWise[day] = 0;
      });
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

      let lastFormCreatedAt =
        forms.length > 0 && forms[0] ? forms[0].createdAt : null;

      // If there is no form created in the lastDaysCount days,
      // then we will look into database for the last created form
      if (lastFormCreatedAt === null) {
        const lastForm = await ctx.db.query.form.findFirst({
          where: eq(form.organizationId, input.organizationId),
          orderBy: (form, { desc }) => [desc(form.createdAt)],
          columns: {
            createdAt: true,
          },
        });
        lastFormCreatedAt = lastForm?.createdAt ?? null;
      }

      return {
        totalCount,
        data: formCountDataArray,
        lastFormCreatedAt,
      };
    }),

  getConversationMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        lastDaysCount: z.number().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({ value: count() })
        .from(conversation)
        .where(eq(conversation.organizationId, input.organizationId));

      const totalCount = result?.value;

      const conversationCountsDataDayWise = {} as Record<string, any>;
      const lastDaysDate = getLastDaysDate(input.lastDaysCount);
      const conversations = await ctx.db.query.conversation.findMany({
        where: (conversation, { eq, and, gte }) =>
          and(
            eq(conversation.organizationId, input.organizationId),
            gte(conversation.createdAt, lastDaysDate),
          ),
        orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
        columns: {
          createdAt: true,
        },
      });

      const currentMonthDaysArray = getCurrentMonthDaysArray();

      currentMonthDaysArray.forEach((day) => {
        conversationCountsDataDayWise[day] = 0;
      });
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

      let lastConversationCreatedAt =
        conversations.length > 0 && conversations[0]
          ? conversations[0].createdAt
          : null;

      // If there is no conversation created in the lastDaysCount days,
      // then we will look into database for the last created conversation
      if (lastConversationCreatedAt === null) {
        const lastConversation = await ctx.db.query.conversation.findFirst({
          where: eq(conversation.organizationId, input.organizationId),
          orderBy: (conversation, { desc }) => [desc(conversation.createdAt)],
          columns: {
            createdAt: true,
          },
        });
        lastConversationCreatedAt = lastConversation?.createdAt ?? null;
      }

      return {
        totalCount,
        data: conversationCountDataArray,
        lastConversationCreatedAt,
      };
    }),
});

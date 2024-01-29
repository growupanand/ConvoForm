import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const metricsRouter = createTRPCRouter({
  getFormMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(5),
        lastDaysCount: z.number().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const totalCount = await ctx.db.form.count({
        where: {
          organizationId: input.organizationId,
        },
      });

      const lastDaysDate = new Date();
      const { lastDaysCount } = input;
      lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
      const forms = await ctx.db.form.findMany({
        where: {
          organizationId: input.organizationId,
          createdAt: {
            gte: lastDaysDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });

      const currentMonthTotalDays = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      // get array of day of lastDaysLength days,
      // E.g if today is 24 then [24, 23, 22, 21, 20, 19, 18]
      const lastDays = Array.from(
        { length: currentMonthTotalDays },
        (_, i) => currentMonthTotalDays - i,
      );

      const formCountsDataDayWise = {} as Record<string, any>;
      lastDays.forEach((day) => {
        formCountsDataDayWise[day] = 0;
      });
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const formCreatedAtDay = form.createdAt.getDate();
        formCountsDataDayWise[formCreatedAtDay] += 1;
      }
      const formCountDataArray = Object.entries(formCountsDataDayWise).map(
        ([name, value]) => ({
          name,
          count: value,
        }),
      );

      return {
        totalCount,
        data: formCountDataArray,
        lastFormCreatedAt: totalCount > 0 ? forms[0].createdAt : null,
      };
    }),

  getConversationMetrics: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(5),
        lastDaysCount: z.number().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const totalCount = await ctx.db.conversation.count({
        where: {
          organizationId: input.organizationId,
        },
      });

      const lastDaysDate = new Date();
      const { lastDaysCount } = input;
      lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
      const conversations = await ctx.db.conversation.findMany({
        where: {
          organizationId: input.organizationId,
          createdAt: {
            gte: lastDaysDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });

      const currentMonthTotalDays = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      // get array of day of lastDaysLength days,
      // E.g if today is 24 then [24, 23, 22, 21, 20, 19, 18]
      const lastDays = Array.from(
        { length: currentMonthTotalDays },
        (_, i) => currentMonthTotalDays - i,
      );

      const conversationCountsDataDayWise = {} as Record<string, any>;
      lastDays.forEach((day) => {
        conversationCountsDataDayWise[day] = 0;
      });
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];
        const conversationCreatedAtDay = conversation.createdAt.getDate();
        conversationCountsDataDayWise[conversationCreatedAtDay] += 1;
      }
      const conversationCountDataArray = Object.entries(
        conversationCountsDataDayWise,
      ).map(([name, value]) => ({
        name,
        count: value,
      }));

      return {
        totalCount,
        data: conversationCountDataArray,
        lastConversationCreatedAt:
          totalCount > 0 ? conversations[0].createdAt : null,
      };
    }),
});

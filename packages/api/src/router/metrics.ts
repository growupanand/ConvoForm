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
      const totalCount = await ctx.db.form.count({
        where: {
          organizationId: input.organizationId,
        },
      });

      const formCountsDataDayWise = {} as Record<string, any>;

      const lastDaysDate = getLastDaysDate(input.lastDaysCount);
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

      let lastFormCreatedAt = forms.length > 0 ? forms[0].createdAt : null;

      // If there is no form created in the lastDaysCount days,
      // then we will look into database for the last created form
      if (lastFormCreatedAt === null) {
        const lastForm = await ctx.db.form.findFirst({
          where: {
            organizationId: input.organizationId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
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
      const totalCount = await ctx.db.conversation.count({
        where: {
          organizationId: input.organizationId,
        },
      });

      const conversationCountsDataDayWise = {} as Record<string, any>;
      const lastDaysDate = getLastDaysDate(input.lastDaysCount);
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
        conversations.length > 0 ? conversations[0].createdAt : null;

      // If there is no conversation created in the lastDaysCount days,
      // then we will look into database for the last created conversation
      if (lastConversationCreatedAt === null) {
        const lastConversation = await ctx.db.conversation.findFirst({
          where: {
            organizationId: input.organizationId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
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

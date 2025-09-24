import { count, eq } from "@convoform/db";
import { form } from "@convoform/db/src/schema";
import { z } from "zod/v4";

import { getCurrentMonthDaysArray } from "../lib/utils";
import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const metricsRouter = createTRPCRouter({
  getFormMetrics: authProtectedProcedure
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
});

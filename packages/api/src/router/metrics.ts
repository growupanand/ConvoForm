import { and, count, eq, gte, sql } from "@convoform/db";
import { form } from "@convoform/db/src/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { getCurrentMonthDaysArray } from "../lib/utils";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const metricsRouter = createTRPCRouter({
  getFormMetrics: orgProtectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.organizationId !== ctx.orgId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Organization access denied",
        });
      }

      const organizationId = ctx.orgId;

      const [result] = await ctx.db
        .select({ value: count() })
        .from(form)
        .where(eq(form.organizationId, organizationId));

      const totalCount = result?.value;

      const formCountsDataDayWise = {} as Record<string, number>;
      const monthFirstDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );

      const formsGroupedByDay = await ctx.db
        .select({
          day: sql<number>`EXTRACT(DAY FROM ${form.createdAt})`.mapWith(Number),
          count: count(),
        })
        .from(form)
        .where(
          and(
            eq(form.organizationId, organizationId),
            gte(form.createdAt, monthFirstDate),
          ),
        )
        .groupBy(sql`EXTRACT(DAY FROM ${form.createdAt})`);

      const currentMonthDaysArray = getCurrentMonthDaysArray();
      for (const day of currentMonthDaysArray) {
        formCountsDataDayWise[day] = 0;
      }

      for (const row of formsGroupedByDay) {
        if (row.day !== null) {
          formCountsDataDayWise[row.day.toString()] = Number(row.count);
        }
      }

      const formCountDataArray = Object.entries(formCountsDataDayWise).map(
        ([name, value]) => ({
          name,
          count: value,
        }),
      );

      const [lastForm] = await ctx.db
        .select({ createdAt: form.createdAt })
        .from(form)
        .where(eq(form.organizationId, organizationId))
        .orderBy(sql`${form.createdAt} DESC`)
        .limit(1);

      const lastCreatedAt = lastForm?.createdAt ?? null;

      return {
        totalCount,
        data: formCountDataArray,
        lastCreatedAt,
      };
    }),
});

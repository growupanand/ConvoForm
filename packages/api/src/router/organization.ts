import { eq, organization } from "@convoform/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.organization.findFirst({
        where: eq(organization.organizationId, input.organizationId),
      });
    }),
});

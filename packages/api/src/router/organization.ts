import { eq } from "@convoform/db";
import { organization } from "@convoform/db/src/schema";
import { z } from "zod";

import { authProtectedProcedure } from "../procedures/authProtectedProcedure";
import { createTRPCRouter } from "../trpc";

export const organizationRouter = createTRPCRouter({
  getOne: authProtectedProcedure
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

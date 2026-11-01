import { count } from "@convoform/db";
import { user } from "@convoform/db/src/schema";
import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

export const usersRouter = createTRPCRouter({
  getTotalCount: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db.select({ value: count() }).from(user);

    return result?.value || 0;
  }),
});

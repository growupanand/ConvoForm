import type { TRPCContext } from "../trpc";

export type ActionContext = Pick<TRPCContext, "db">;

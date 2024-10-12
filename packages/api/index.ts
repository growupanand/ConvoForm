import { type AppRouter, appRouter } from "./src/router/root";
import {
  type TRPCContext,
  createCaller,
  createTRPCContext,
  protectedProcedure,
} from "./src/trpc";

export type { AppRouter, TRPCContext };
export { createTRPCContext, appRouter, protectedProcedure, createCaller };

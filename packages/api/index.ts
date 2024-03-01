import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { checkRateLimit, RATE_LIMIT_ERROR_NAME } from "./src/lib/rateLimit";
import type { AppRouter } from "./src/router/root";
import { appRouter } from "./src/router/root";
import { createCallerFactory, createTRPCContext } from "./src/trpc";

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;
export {
  createTRPCContext,
  appRouter,
  createCaller,
  checkRateLimit,
  RATE_LIMIT_ERROR_NAME,
};
export type { AppRouter, RouterInputs, RouterOutputs };

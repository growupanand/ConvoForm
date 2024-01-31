import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "./server/api/root";

export { createTRPCContext } from "./server/api/trpc";

export type { AppRouter } from "./server/api/root";

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "./src/router/root";

export { createTRPCContext } from "./src/trpc";

export type { AppRouter } from "./src/router/root";

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

"use server";

import {
  type AppRouter,
  appRouter,
  createCaller,
  createTRPCContext,
} from "@convoform/api";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { makeQueryClient } from "./react";

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
const caller = createCaller(appRouter);
export const trpcClient = caller(createTRPCContext);

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.

export const getQueryClient = cache(makeQueryClient);
export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  trpcClient,
  getQueryClient,
);

export const api = trpc;

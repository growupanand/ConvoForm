/**
 * Reference - https://github.com/t3-oss/create-t3-turbo
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@convoform/db";
import { isRateLimitError } from "@convoform/rate-limiter";
import { initTRPC } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/unstable-core-do-not-import";
import superjson from "superjson";
import { ZodError } from "zod";

export type QueryClientMeta = {
  allowRetry?: boolean;
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async () => {
  return {
    db,
    auth: await auth(),
    user: await currentUser(),
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
export const t = initTRPC
  .context<TRPCContext>()
  .meta<QueryClientMeta>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
      // Add rate limit error data into response
      let rateLimitError = null;
      if (isRateLimitError(error) && typeof error.cause === "object") {
        shape.code = TRPC_ERROR_CODES_BY_KEY.TOO_MANY_REQUESTS;
        shape.data.httpStatus = 429;
        rateLimitError = {
          resetTimeStamp: error.resetTimeStamp,
        };
      }

      let zodError = null;
      if (error.cause instanceof ZodError) {
        zodError = error.cause.flatten();
      }

      return {
        ...shape,
        data: {
          zodError,
          rateLimitError,
        },
      };
    },
  });

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCaller = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;

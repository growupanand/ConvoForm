"use client";

import type { AppRouter } from "@convoform/api";
import { toast } from "@convoform/ui";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { loggerLink } from "@trpc/client";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";

import { getTRPCUrl } from "@/lib/url";
import { getTRPCErrorMessage } from "./utils";

export const api = createTRPCReact<AppRouter>();

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: (err) => {
        toast.error(getTRPCErrorMessage(err));
      },
    }),
    mutationCache: new MutationCache({
      onError: (err, inputParams, _, mutation) => {
        /**
         * Show retry button on error toast if allowRetry is true
         */
        const { allowRetry } = mutation.meta ?? {};
        const retryAction = {
          label: "Retry",
          onClick: () => mutation.execute(inputParams),
        };

        toast.error(getTRPCErrorMessage(err), {
          action: allowRetry ? retryAction : undefined,
        });
      },
    }),
  });
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getTRPCUrl(),
          // You can pass any HTTP headers you wish here
          async headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
          transformer: SuperJSON,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}

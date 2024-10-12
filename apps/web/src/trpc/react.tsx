"use client";

import type { AppRouter } from "@convoform/api";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink } from "@trpc/client";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";

import { getTRPCUrl } from "@/lib/url";
import { isRateLimitErrorResponse } from "@convoform/rate-limiter";

export const api = createTRPCReact<AppRouter>();

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: false,
      },
      mutations: {
        onError: (err) => {
          if (isRateLimitErrorResponse(err)) {
            toast({
              title: err.message ?? "Too many requests",
              duration: 1500,
            });
          }
        },
        throwOnError: false,
      },
    },
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

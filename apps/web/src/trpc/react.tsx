"use client";

import { useState } from "react";
import type { AppRouter } from "@convoform/api";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  loggerLink,
  TRPCClientError,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import { isRateLimitError } from "@/lib/errorHandlers";
import { getTRPCUrl } from "@/lib/url";

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchInterval: false,
            retry: false,
          },
          mutations: {
            onError: (err) => {
              if (err instanceof TRPCClientError && isRateLimitError(err)) {
                toast({
                  title: err.message ?? "Too many requests",
                  duration: 1500,
                });
              }
            },
            throwOnError: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getTRPCUrl(),
          async headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

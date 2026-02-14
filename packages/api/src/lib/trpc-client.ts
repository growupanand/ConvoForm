import { createTRPCClient, httpLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../router/root";
import { getBaseUrl } from "../utils/url";

export const trpcFetchClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        return {};
      },
      fetch: (url, options) => fetch(url as any, options as any),
    }),
  ],
});

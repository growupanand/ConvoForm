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
      fetch: async (url, options) => {
        const body = options?.body;
        const headers = new Headers(options?.headers);

        if (body && typeof body === "string") {
          try {
            // We need to import signPayload dynamically or have it available.
            // Since this is in `packages/api`, we can import from `@convoform/common`.
            // Assuming this code runs in an environment with Web Crypto (Edge/Node 18+).
            const { signPayload } = await import("@convoform/common");
            const { env } = await import("../env");

            const signature = await signPayload(
              body,
              env.INTERNAL_EMAIL_API_SECRET,
            );
            headers.set("X-ConvoForm-Signature", signature);
          } catch (error) {
            console.error("Failed to sign request:", error);
          }
        }

        return fetch(
          url as any,
          {
            ...options,
            headers,
          } as any,
        );
      },
    }),
  ],
});

import { appRouter, createTRPCContext } from "@convoform/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

// export const runtime = "edge";
export const maxDuration = 60;

export function OPTIONS(req: NextRequest) {
  const response = new Response(null, {
    status: 204,
  });
  applyCorsHeaders(response, req);
  return response;
}

const handler = async (req: NextRequest) => {
  let rawBody: string | undefined;
  try {
    const clone = req.clone();
    rawBody = await clone.text();
  } catch (error) {
    console.warn("Failed to read request body for context:", error);
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: (opts) => createTRPCContext({ req: opts.req, rawBody }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }: any) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

  applyCorsHeaders(response, req);
  return response;
};

function applyCorsHeaders(res: Response, req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
  ];

  // Allow all localhost ports in development
  const isLocalhost = origin?.startsWith("http://localhost:");

  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === "development" && isLocalhost))
  ) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    // Default to strict if no match (or no origin) - though browsers might block if we don't send ACAO
    // We can default to the main app URL
    if (process.env.NEXT_PUBLIC_APP_URL) {
      res.headers.set(
        "Access-Control-Allow-Origin",
        process.env.NEXT_PUBLIC_APP_URL,
      );
    }
  }

  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
}

export { handler as GET, handler as POST };

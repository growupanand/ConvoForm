import { cache } from "react";
import { createCaller, createTRPCContext } from "@convoform/api";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  return createTRPCContext();
});

export const api = createCaller(createContext);

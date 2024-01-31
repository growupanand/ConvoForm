import type { AppRouter } from "@convoform/api";
import { createTRPCReact } from "@trpc/react-query";

export const api: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();

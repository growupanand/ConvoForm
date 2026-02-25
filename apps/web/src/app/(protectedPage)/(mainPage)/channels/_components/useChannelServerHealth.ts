"use client";

import { api } from "@/trpc/react";

/**
 * Hook to check if the channels-server is online.
 * Polls the server every 30 seconds and returns the current status.
 *
 * @returns `isOnline` — `true` if the server is reachable, `false` otherwise.
 *          `isLoading` — `true` during the initial fetch.
 *
 * @example
 * ```tsx
 * function ChannelUI() {
 *   const { isOnline, isLoading } = useChannelServerHealth();
 *
 *   if (!isOnline) {
 *     return <Alert>Channel server is offline</Alert>;
 *   }
 *
 *   return <ChannelManagement />;
 * }
 * ```
 */
export function useChannelServerHealth() {
  const { data, isLoading } =
    api.channelConnection.channelServerHealth.useQuery(undefined, {
      refetchInterval: 30_000,
      refetchOnWindowFocus: true,
    });

  return {
    isOnline: data?.isOnline ?? false,
    isLoading,
  };
}

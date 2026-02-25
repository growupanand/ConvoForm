import { Skeleton } from "@convoform/ui";

/**
 * Skeleton loader for the ChannelConnectionsList component.
 * Renders placeholder rows matching the list layout.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ChannelConnectionsListLoading />}>
 *   <ChannelConnectionsList />
 * </Suspense>
 * ```
 */
export function ChannelConnectionsListLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={`skeleton-${i}`}
            className="flex items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-9 rounded-full" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

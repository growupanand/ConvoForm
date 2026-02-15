import { Card, CardContent, CardHeader, Skeleton } from "@convoform/ui";

/**
 * Loading skeleton for the IntegrationList component.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<IntegrationListLoading />}>
 *   <IntegrationList />
 * </Suspense>
 * ```
 */
export default function IntegrationListLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

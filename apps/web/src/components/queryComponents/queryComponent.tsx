import { Button } from "@convoform/ui";
import type { UseQueryResult } from "@tanstack/react-query";

import Spinner from "../common/spinner";

type Props<TData, TError> = {
  query: UseQueryResult<TData, TError>;
  loadingComponent?: React.ReactNode;
  errorComponent?: (refetch: () => void) => React.ReactNode;
  children: (data: TData) => React.ReactNode;
};

export function QueryComponent<TData, TError>({
  query,
  loadingComponent,
  errorComponent,
  children,
}: Props<TData, TError>) {
  const { isPending, isError, data, refetch } = query;

  if (isPending) {
    return loadingComponent ?? <Spinner />;
  }

  if (isError) {
    return (
      errorComponent?.(refetch) ?? (
        <div>
          Something went wrong <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )
    );
  }

  if (data) {
    return children?.(data) ?? null;
  }

  return null;
}

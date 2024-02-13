import { Button } from "@convoform/ui/components/ui/button";
import { UseQueryResult } from "@tanstack/react-query";

import Spinner from "./spinner";

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
  const { isFetching, isError, data, refetch } = query;

  if (isFetching) {
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

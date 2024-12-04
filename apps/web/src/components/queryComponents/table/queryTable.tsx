import type { UseQueryResult } from "@tanstack/react-query";

import { TableComponentLoading, TableEmpty, TableError } from "./table";

type PropsBase<TData, TError> = {
  query: UseQueryResult<TData, TError>;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
};

type PropsSuccessWithParsedData<TData, PData> = {
  getTableData: (data: TData) => PData;
  successComponent: (data: PData) => React.ReactNode;
};

type PropsSuccess<TData> = {
  getTableData?: undefined;
  successComponent: (data: TData) => React.ReactNode;
};

type Props<TData, TError, PData> = PropsBase<TData, TError> &
  (PropsSuccessWithParsedData<TData, PData> | PropsSuccess<TData>);

export function QueryTable<TData, TError, PData>(
  props: Props<TData, TError, PData>,
) {
  const { query } = props;

  if (query.isLoading) {
    return props.loadingComponent ?? <TableComponentLoading />;
  }

  if (query.isError) {
    return props.errorComponent ?? <TableError onRetry={query.refetch} />;
  }

  if (query.isSuccess) {
    if (
      query.data === null ||
      (Array.isArray(query.data) && query.data.length === 0)
    ) {
      return props.emptyComponent ?? <TableEmpty />;
    }

    if (props.getTableData) {
      const parsedData = props.getTableData(query.data);
      return props.successComponent(parsedData);
    }

    return props.successComponent(query.data);
  }
}

import { UseQueryResult } from "@tanstack/react-query";

import { QueryComponent } from "../queryComponent";
import {
  TableComponent,
  TableComponentLoading,
  TableEmpty,
  TableError,
} from "./table";

type Props<TData, TError> = {
  query: UseQueryResult<TData, TError>;
  getTableData: (data: TData) => Record<string, string>[];
  showExportButton?: boolean;
  exportFileName?: string;
  emptyComponent?: React.ReactNode;
};

export function QueryTable<TData, TError>(props: Props<TData, TError>) {
  return (
    <QueryComponent
      query={props.query}
      loadingComponent={<TableComponentLoading />}
      errorComponent={(refetch) => <TableError onRetry={refetch} />}
    >
      {(data) => {
        const tableData = props.getTableData(data);
        return tableData.length > 0 ? (
          <TableComponent
            tableData={tableData}
            showExportButton={props.showExportButton}
            exportFileName={props.exportFileName}
          />
        ) : (
          props.emptyComponent ?? <TableEmpty />
        );
      }}
    </QueryComponent>
  );
}

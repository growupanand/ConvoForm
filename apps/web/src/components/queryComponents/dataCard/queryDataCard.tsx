import type { UseQueryResult } from "@tanstack/react-query";

import { timeAgo } from "@/lib/utils";
import { QueryComponent } from "../queryComponent";
import { DataCard, DataCardError, DataCardSkeleton } from "./dataCard";

type DataCardResult = {
  totalCount?: number;
  lastCreatedAt: Date | null;
  data: {
    name: string;
    count: any;
  }[];
};

type Props<TData extends DataCardResult, TError> = {
  query: UseQueryResult<TData, TError>;
  title: string;
};

export function QueryDataCard<TData extends DataCardResult, TError>(
  props: Readonly<Props<TData, TError>>,
) {
  return (
    <QueryComponent
      query={props.query}
      loadingComponent={<DataCardSkeleton />}
      errorComponent={(refetch) => (
        <DataCardError onRetry={refetch} dataSourceName={props.title} />
      )}
    >
      {(data) => {
        return (
          <DataCard
            title={props.title}
            mainValue={data.totalCount?.toString() ?? "-"}
            secondaryValue={
              data.lastCreatedAt
                ? `Last ${timeAgo(data.lastCreatedAt)}`
                : undefined
            }
            dataType="Total"
            chartData={data.data}
          />
        );
      }}
    </QueryComponent>
  );
}

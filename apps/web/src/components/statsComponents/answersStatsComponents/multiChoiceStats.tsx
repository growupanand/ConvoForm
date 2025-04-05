"use client";

import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Progress,
  Skeleton,
} from "@convoform/ui";
import { CheckSquare2 } from "lucide-react";
import { StatsGrid } from "../statsGrid";

type MultiChoiceStatsProps = {
  formId: string;
  title?: string;
};

export const MultiChoiceStats = ({
  formId,
  title = "Multiple Choice Questions",
}: MultiChoiceStatsProps) => {
  const multiChoiceStatsQuery = api.conversation.multiChoiceStats.useQuery({
    formId,
  });

  return (
    <QueryComponent
      query={multiChoiceStatsQuery}
      loadingComponent={<MultiChoiceStatsSkeleton title={title} />}
    >
      {(data) => (
        <div>
          <h3 className="text-base font-medium text-muted-foreground mb-4">
            <CheckSquare2 className="mr-2 h-4 w-4 inline" />
            {title}
          </h3>
          <StatsGrid columns={4} minWidth="250px" className="mb-8 gap-6">
            {data.length === 0 ? (
              <p className="text-muted-foreground">
                No multiple choice data available.
              </p>
            ) : (
              data.map((field, index) => (
                <Card key={`${field.fieldName}-${index}`} className="group">
                  <CardHeader>
                    <div className=" mb-2 gap-4 flex justify-between items-start">
                      <h4 className="font-semibold leading-tight">
                        {field.fieldName}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap font-medium"
                      >
                        {field.totalResponses} total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {field.options.map((option) => (
                        <div key={option.option} className="relative">
                          <Progress
                            value={option.percentage}
                            className="pe-0"
                            trackClassName="bg-white h-6 transition-[border] duration-300 border border-transparent group-hover:border-muted"
                            indicatorClassName="bg-muted"
                            textClassName="text-secondary-foreground text-xs"
                          >
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-2 z-10">
                                {/* If you have flags, add them here */}
                                <span className="font-semibold">
                                  {option.option}
                                </span>
                              </div>
                              <div className="z-10">
                                <span className="font-medium group-hover:hidden">
                                  {option.percentage}%
                                </span>
                                <span className="font-medium hidden group-hover:inline">
                                  {option.count}
                                </span>
                              </div>
                            </div>
                          </Progress>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </StatsGrid>
        </div>
      )}
    </QueryComponent>
  );
};

function MultiChoiceStatsSkeleton({ title }: { title?: string }) {
  return (
    <div>
      <h3 className="text-base font-medium text-muted-foreground mb-4">
        <CheckSquare2 className="mr-2 h-4 w-4 inline" />
        {title}
      </h3>
      <StatsGrid columns={4} minWidth="250px" className="mb-8 gap-6">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="group">
            <CardHeader>
              <div className="text-sm font-medium mb-2 flex justify-between items-start">
                <Skeleton className="h-5 w-1/2" />
                <Badge variant="secondary">
                  <Skeleton className="h-2" />
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <Skeleton className="h-2 w-2/3 rounded-lg" />
                <Skeleton className="h-2 w-1/4 rounded-lg" />
                <Skeleton className="h-2 w-1/2 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </StatsGrid>
    </div>
  );
}

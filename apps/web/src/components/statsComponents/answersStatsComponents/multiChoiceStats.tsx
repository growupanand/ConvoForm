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
import { StatsTitle, StatsTitleSkeleton } from "../statsTitle";

type MultiChoiceStatsProps = {
  formId: string;
  title?: string;
};

export const MultiChoiceStats = ({
  formId,
  title = "Choice Question Analysis",
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
          <StatsTitle title={title} icon={CheckSquare2} />
          <StatsGrid minWidth="250px" className="mb-8 gap-6">
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
                    <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                      {field.options.map((option) => (
                        <div key={option.option} className="relative">
                          <Progress value={30} variant="subtle" size="sm">
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

function MultiChoiceStatsSkeleton({
  title = "Choice Question Analysis",
}: { title?: string }) {
  return (
    <div>
      <StatsTitleSkeleton title={title} icon={CheckSquare2} />

      <StatsGrid minWidth="250px" className="mb-8 gap-6">
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

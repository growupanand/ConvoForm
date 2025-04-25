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
import { Star } from "lucide-react";
import { StatsGrid } from "../statsGrid";

type RatingStatsProps = {
  formId: string;
  title?: string;
};

export const RatingStats = ({
  formId,
  title = "Rating Question Analysis",
}: RatingStatsProps) => {
  const ratingStatsQuery = api.conversation.ratingStats.useQuery({
    formId,
  });

  return (
    <QueryComponent
      query={ratingStatsQuery}
      loadingComponent={<RatingStatsSkeleton title={title} />}
    >
      {(data) => (
        <div>
          <h3 className="text-base font-medium text-muted-foreground mb-4">
            <Star className="mr-2 h-4 w-4 inline" />
            {title}
          </h3>
          <StatsGrid minWidth="250px" className="mb-8 gap-6">
            {data.length === 0 ? (
              <p className="text-muted-foreground">No rating data available.</p>
            ) : (
              data.map((field, index) => (
                <Card key={`${field.fieldName}-${index}`} className="group">
                  <CardHeader>
                    <div className="mb-2 gap-4 flex justify-between items-start">
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold">
                        {field.averageRating}
                      </span>
                      <div className="flex">
                        {Array.from({ length: field.maxRating }, (_, i) => (
                          <Star
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            key={i}
                            size={16}
                            className={
                              i < Number.parseFloat(field.averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        average rating
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {field.distribution.map((item) => (
                        <div key={item.rating} className="relative">
                          <Progress
                            value={item.percentage}
                            className="pe-0"
                            trackClassName="bg-white h-6 transition-[border] duration-300 border border-transparent group-hover:border-muted"
                            indicatorClassName="bg-muted"
                            textClassName="text-secondary-foreground text-xs"
                          >
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-2 z-10">
                                <span className="font-semibold flex items-center">
                                  {item.rating}{" "}
                                  <Star size={12} className="ml-1" />
                                </span>
                              </div>
                              <div className="z-10">
                                <span className="font-medium group-hover:hidden">
                                  {item.percentage}%
                                </span>
                                <span className="font-medium hidden group-hover:inline">
                                  {item.count}
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

function RatingStatsSkeleton({ title }: { title?: string }) {
  return (
    <div>
      <h3 className="text-base font-medium text-muted-foreground mb-4">
        <Star className="mr-2 h-4 w-4 inline" />
        {title}
      </h3>
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
              <Skeleton className="h-4 w-24 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <Skeleton className="h-2 w-2/3 rounded-lg" />
                <Skeleton className="h-2 w-1/4 rounded-lg" />
                <Skeleton className="h-2 w-1/2 rounded-lg" />
                <Skeleton className="h-2 w-3/4 rounded-lg" />
                <Skeleton className="h-2 w-1/3 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </StatsGrid>
    </div>
  );
}

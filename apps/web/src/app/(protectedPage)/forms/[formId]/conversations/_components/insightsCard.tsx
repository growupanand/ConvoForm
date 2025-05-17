import type { conversationInsightsSchema } from "@convoform/db/src/schema";
import {
  Badge,
  Card,
  CardContent,
  SectionHeading,
  Skeleton,
} from "@convoform/ui";
import { Lightbulb } from "lucide-react";
import type { z } from "zod";

type InsightsCardProps = {
  insights: z.infer<typeof conversationInsightsSchema> | undefined;
};

export default function InsightsCard({ insights }: InsightsCardProps) {
  if (!insights) {
    return null;
  }

  // Define badge variants based on tone and sentiment
  const getToneVariant = (tone: string) => {
    switch (tone) {
      case "formal":
        return "secondary";
      case "casual":
        return "outline";
      case "frustrated":
        return "destructive";
      case "enthusiastic":
        return "customSuccess";
      default:
        return "outline";
    }
  };

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "customSuccess";
      case "negative":
        return "destructive";
      case "mixed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className=" border-none shadow-none bg-background dark:bg-slate-900 group">
      <CardContent className="p-4 ">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <SectionHeading className="ps-0 mb-0">
              <Lightbulb className="size-5 text-blue-500 inline-block me-1" />
              Insights
            </SectionHeading>
            <div className="flex gap-2">
              <Badge
                variant={getToneVariant(insights.userTone)}
                className="text-xs capitalize"
              >
                {insights.userTone}
              </Badge>
              <Badge
                variant={getSentimentVariant(insights.userSentiment)}
                className="text-xs capitalize"
              >
                {insights.userSentiment}
              </Badge>
            </div>
          </div>
          <div className="max-h-[200px]  overflow-y-auto resize-y">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium">TLDR:</span> {insights.tldr}
            </p>

            {insights.externalQueries.length > 0 && (
              <>
                <h4 className="text-sm font-medium mt-3 mb-1">
                  User Inquiries
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {insights.externalQueries.map((query, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <li key={i}>{query}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

InsightsCard.Skeleton = function InsightsCardSkeleton() {
  return (
    <Card className=" border-none shadow-none  bg-background dark:bg-slate-900">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionHeading className="ps-0 mb-0">
              <Lightbulb className="size-5 text-amber-500 inline-block me-1" />
              Insights
            </SectionHeading>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

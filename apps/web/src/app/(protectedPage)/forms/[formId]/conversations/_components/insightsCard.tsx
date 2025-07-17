import type { conversationInsightsSchema } from "@convoform/db/src/schema";
import { Card, CardContent, Skeleton } from "@convoform/ui";
import type { z } from "zod";
import {} from "./utils";

type InsightsCardProps = {
  insights: z.infer<typeof conversationInsightsSchema> | undefined;
};

export default function InsightsCard({ insights }: InsightsCardProps) {
  if (!insights) {
    return null;
  }

  return (
    <InsightsCardShell>
      <CardContent className="p-4 max-h-[200px]  overflow-y-auto resize-y">
        <p className="text-sm text-emphasis-foreground leading-relaxed">
          <span className="font-medium">TLDR:</span> {insights.tldr}
        </p>

        {insights.externalQueries.length > 0 && (
          <>
            <h4 className="text-sm font-medium mt-3 mb-1">User Inquiries</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {insights.externalQueries.map((query, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <li key={i}>{query}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </InsightsCardShell>
  );
}

InsightsCard.Skeleton = function InsightsCardSkeleton() {
  return (
    <InsightsCardShell>
      <CardContent className="p-4">
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </InsightsCardShell>
  );
};

function InsightsCardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className=" border-none shadow-none bg-subtle dark:bg-slate-900 group">
      {children}
    </Card>
  );
}

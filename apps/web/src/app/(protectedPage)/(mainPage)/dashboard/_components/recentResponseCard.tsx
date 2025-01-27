"use client";

import { Skeleton } from "@convoform/ui";
import { InboxIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { EmptyCard } from "@/components/common/emptyCard";
import { ListCard } from "@/components/common/list";
import { ListItem } from "@/components/common/listItem";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@convoform/ui";

export function RecentResponsesCard({ take }: Readonly<{ take: number }>) {
  const { data, isLoading } = api.conversation.getRecentResponses.useQuery({
    take: take,
  });

  if (isLoading) {
    return (
      <RecentResponsesCardShell>
        <RecentResponsesListLoading />
      </RecentResponsesCardShell>
    );
  }

  if (data && data.length > 0) {
    return (
      <RecentResponsesCardShell>
        <ListCard>
          {data.map((response) => (
            <motion.div key={response.id}>
              <ListItem>
                <Link
                  href={`/forms/${response.formId}/conversations/${response.id}`}
                >
                  <div className="grid py-2">
                    <span className="text-muted-foreground text-xs text-nowrap">
                      {timeAgo(response.createdAt)}
                    </span>
                    <div className="flex items-baseline justify-between gap-4  w-full overflow-hidden">
                      <span className="truncate">{response.name}</span>
                      <span className="text-muted-foreground text-xs truncate">
                        {response.form.name}
                      </span>
                    </div>
                  </div>
                </Link>
              </ListItem>
            </motion.div>
          ))}
        </ListCard>
      </RecentResponsesCardShell>
    );
  }

  return (
    <RecentResponsesCardShell>
      <EmptyCard
        title="No recent responses"
        illustration={<InboxIcon className="text-muted-foreground h-16 w-16" />}
      />
    </RecentResponsesCardShell>
  );
}

function RecentResponsesCardShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Card className="rounded-3xl bg-background" noShadow>
      <CardHeader className="pb-2">
        <CardTitle>Recent responses</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RecentResponsesListLoading() {
  return (
    <ListCard>
      {[...Array(3)].map((_, i) => (
        // biome-ignore lint: ignored
        <ListItem key={i}>
          <div className="flex items-start justify-between py-2">
            <div className="grid gap-1">
              <Skeleton className="h-[10px] w-[150px]" />
              <Skeleton className="h-[8px] w-[100px]" />
            </div>
            <Skeleton className="h-[10px] w-[50px]" />
          </div>
        </ListItem>
      ))}
    </ListCard>
  );
}

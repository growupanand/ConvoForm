"use client";

import Link from "next/link";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import { ListCard } from "@/components/common/list";
import { ListItem } from "@/components/common/listItem";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";

export function RecentResponseList({
  organizationId,
}: Readonly<{ organizationId: string }>) {
  const { data, isFetching } = api.conversation.getRecentResponses.useQuery({
    organizationId,
    take: 10,
  });

  if (isFetching) {
    return <RecentResponseListLoading />;
  }

  if (data) {
    return (
      <ListCard>
        {data.map((response) => (
          <ListItem key={response.id}>
            <Link
              href={`/forms/${response.formId}/conversations/${response.id}`}
            >
              <div className="flex items-center justify-between py-2">
                <div className="grid">
                  <span>{response.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {response.form.name}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {timeAgo(response.createdAt)}
                </span>
              </div>
            </Link>
          </ListItem>
        ))}
      </ListCard>
    );
  }

  return null;
}

function RecentResponseListLoading() {
  return (
    <ListCard>
      {[...Array(3)].map((_, i) => (
        <ListItem key={i}>
          <div className="flex items-center justify-between py-2">
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

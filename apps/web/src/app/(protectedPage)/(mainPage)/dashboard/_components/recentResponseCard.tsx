"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { motion, stagger, useAnimate } from "framer-motion";
import { InboxIcon } from "lucide-react";

import { CardShell } from "@/components/common/cardShell";
import { EmptyCard } from "@/components/common/emptyCard";
import { ListCard } from "@/components/common/list";
import { ListItem } from "@/components/common/listItem";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";

export function RecentResponsesCard({ take }: Readonly<{ take: number }>) {
  const [scope, animate] = useAnimate();
  const { data, isLoading } = api.conversation.getRecentResponses.useQuery({
    take: take,
  });
  const emptyData = data?.length === 0;

  const loadListItems = async () => {
    if (!isLoading && !emptyData) {
      animate(
        ".slide-down-list-item",
        { opacity: 1, translate: 0 },
        { delay: stagger(0.05), duration: 0.2 },
      );
    }
  };

  useEffect(() => {
    loadListItems();
  }, [isLoading, emptyData]);

  if (isLoading) {
    return (
      <RecentResponsesCardShell>
        <RecentResponsesListLoading />
      </RecentResponsesCardShell>
    );
  }

  if (data && data.length > 0) {
    return (
      <motion.div
        className="slide-left-list"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.5 },
          translate: "0 -1rem",
        }}
      >
        <RecentResponsesCardShell>
          <motion.div ref={scope}>
            <ListCard>
              {data.map((response) => (
                <motion.div
                  className="slide-down-list-item"
                  key={response.id}
                  initial={{ opacity: 0, translate: "0 -0.5rem" }}
                >
                  <ListItem>
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
                </motion.div>
              ))}
            </ListCard>
          </motion.div>
        </RecentResponsesCardShell>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="slide-left-list"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.5 },
        translate: "0 -1rem",
      }}
    >
      <RecentResponsesCardShell>
        <EmptyCard
          title="No recent responses"
          illustration={
            <InboxIcon className="text-muted-foreground h-16 w-16" />
          }
        />
      </RecentResponsesCardShell>
    </motion.div>
  );
}

function RecentResponsesCardShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CardShell
      title="Recent responses"
      secondaryText="As you receive responses, they'll appear here."
    >
      {children}
    </CardShell>
  );
}

function RecentResponsesListLoading() {
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

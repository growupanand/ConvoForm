"use client";

import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { socket } from "@convoform/websocket-client";
import { GanttChartSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SecondaryNavigation } from "@/components/common/secondaryNavigation";
import { api } from "@/trpc/react";
import MainNavTab from "../../_components/mainNavTab";
import { ConversationsNavigation } from "./conversationsNavigation";

type Props = {
  formId: string;
  organizationId: string;
};

type State = {
  open: boolean;
};

export function ConversationsSidebar({ formId, organizationId }: Props) {
  const pathname = usePathname();

  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const {
    isLoading: isLoadingConversations,
    data,
    refetch,
  } = api.conversation.getAll.useQuery({
    formId,
  });

  const conversations = data ?? [];
  const eventListener = `form:${formId}`;
  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  // Update conversations list when a new conversation is created
  useEffect(() => {
    socket.on(eventListener, (data) => {
      const { event } = data;
      if (typeof event === "string") {
        if (event === "conversations:started") {
          sonnerToast.info("New conversation started", {
            position: "top-left",
            dismissible: true,
            duration: 1500,
          });
        }
        if (event === "conversations:updated") {
          refetch();
        }
      }
    });

    return () => {
      if (socket.hasListeners(eventListener)) {
        socket.off(eventListener);
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  if (isLoadingConversations) {
    return <ConversationsSidebarSkeleton />;
  }

  return (
    <div className="">
      <div className="relative flex flex-col px-3 max-h-[calc(100vh-100px)]">
        <div>
          <div className="mb-5">
            <MainNavTab formId={formId} organizationId={organizationId} />
          </div>

          <div className="mb-5">
            <SecondaryNavigation
              items={[
                {
                  href: `/forms/${formId}/conversations`,
                  title: (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-lg">All conversations</span>
                      <GanttChartSquare
                        className="text-muted-foreground"
                        size={20}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className="relative h-full grow overflow-auto pb-5">
          <div className="text-muted-foreground mb-2 px-4 text-sm">
            Recent conversations
          </div>
          <div>
            <ConversationsNavigation
              conversations={conversations}
              formId={formId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ConversationsSidebarSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 px-3">
      <MainNavTab.Skeleton />
      <div className="px-4">
        <ConversationsNavigation.ConversationsCardSkelton />
      </div>
    </div>
  );
};

ConversationsSidebar.Skeleton = ConversationsSidebarSkeleton;

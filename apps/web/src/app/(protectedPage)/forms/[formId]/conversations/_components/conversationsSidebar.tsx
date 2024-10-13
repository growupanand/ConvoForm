"use client";

import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { socket } from "@convoform/websocket-client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/trpc/react";
import MainNavTab from "../../_components/mainNavTab";
import { ConversationsNavigation } from "./conversationsNavigation";
import { useOrganization } from "@clerk/nextjs";

type Props = {
  formId: string;
};

type State = {
  open: boolean;
};

export function ConversationsSidebar({ formId }: Props) {
  const pathname = usePathname();
  const { organization, isLoaded } = useOrganization();
  const organizationId = organization?.id;

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

  if (isLoadingConversations || !isLoaded || !organizationId) {
    return <ConversationsSidebarSkeleton />;
  }

  return (
    <div className="">
      <div className="relative flex flex-col px-3 max-h-[calc(100vh-100px)]">
        <div>
          <div className="mb-5">
            <MainNavTab formId={formId} organizationId={organizationId} />
          </div>
        </div>
        <div className="relative h-full grow overflow-auto pb-5">
          <ConversationsNavigation
            conversations={conversations}
            formId={formId}
          />
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

"use client";
import {
  registerEventHandler,
  removeEventHandler,
  sendMessage,
} from "@convoform/websocket-client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  SecondaryNavigation,
  type SecondaryNavigationItem,
} from "@/components/common/secondaryNavigation";
import { api } from "@/trpc/react";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "@convoform/ui";
import { ChartColumnIncreasing, Table } from "lucide-react";
import MainNavTab from "../../_components/mainNavTab";
import { ConversationsNavigation } from "./conversationsNavigation";

type Props = {
  formId: string;
};

type State = {
  open: boolean;
};

export function ConversationsSidebar({ formId }: Props) {
  const secondaryNavigationItems: SecondaryNavigationItem[] = [
    {
      title: "Analytics",
      href: `/forms/${formId}/conversations`,
      icon: <ChartColumnIncreasing className="size-4" />,
    },
    {
      title: "Table View",
      href: `/forms/${formId}/conversations/table`,
      icon: <Table className="size-4" />,
    },
  ];

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
    refetch: refetchConversationsList,
  } = api.conversation.getAll.useQuery({
    formId,
  });

  const conversations = data ?? [];
  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  useEffect(() => {
    // Use sendMessage instead of socket.emit
    sendMessage("join-room-form", { formId });

    // Handler for conversation started events
    const handleConversationStarted = () => {
      toast.info("New form submission started!", {
        position: "top-left",
        dismissible: true,
        duration: 1500,
      });
      refetchConversationsList();
    };

    // Handler for conversation stopped events
    const handleConversationStopped = () => {
      refetchConversationsList();
    };

    // Register event handlers
    registerEventHandler("conversation:started", handleConversationStarted);
    registerEventHandler("conversation:stopped", handleConversationStopped);

    return () => {
      // Clean up event handlers when component unmounts
      removeEventHandler("conversation:started", handleConversationStarted);
      removeEventHandler("conversation:stopped", handleConversationStopped);
    };
  }, [formId]);

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
      <div className="relative flex flex-col gap-4 px-3 max-h-[calc(100vh-100px)]">
        <div>
          <div>
            <MainNavTab formId={formId} organizationId={organizationId} />
          </div>
          <div>
            <SecondaryNavigation items={secondaryNavigationItems} />
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

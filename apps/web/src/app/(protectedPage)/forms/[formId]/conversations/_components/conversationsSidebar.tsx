"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@convoform/ui/components/ui/sheet";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { socket } from "@convoform/websocket-client";
import { GanttChartSquare, List } from "lucide-react";

import { SecondaryNavigation } from "@/components/common/secondaryNavigation";
import { api } from "@/trpc/react";
import MainNavTab from "../../_components/mainNavTab";
import { ConversationsNavigation } from "./conversationsNavigation";

type Props = {
  formId: string;
};

type State = {
  open: boolean;
};

export default function ConversationsSidebar({ formId }: Props) {
  const pathname = usePathname();
  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  const { isLoading, data, refetch } = api.conversation.getAll.useQuery({
    formId,
  });

  const isLoadingConversations = isLoading;
  const conversations = data ?? [];
  const eventListener = `form:${formId}`;

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  // Update conversations list when a new conversation is created
  useEffect(() => {
    socket.on(eventListener, (data) => {
      const { event } = data;
      if (typeof event === "string" && event === "conversation:created") {
        toast({
          title: "New conversation created.",
          duration: 2000,
        });
        refetch();
      }
    });
    return () => {
      if (socket.hasListeners(eventListener)) {
        socket.off(eventListener);
      }
    };
  }, []);

  return (
    <div className="px-3">
      <div className="lg:hidden">
        <MainNavTab formId={formId} />
        <Sheet
          open={open}
          onOpenChange={(status) => setState((cs) => ({ ...cs, open: status }))}
        >
          <div className="flex items-center justify-start py-3">
            <SheetTrigger asChild>
              <Button variant="outline">
                <List size={20} className="mr-2" />
                <span>Conversations</span>
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-[90%] ">
            <SheetClose />
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
            <div className="text-muted-foreground mb-2 px-4 text-sm">
              Recent conversations
            </div>
            {isLoadingConversations || !formId ? (
              <ConversationsNavigation.ConversationsCardSkelton />
            ) : (
              <ConversationsNavigation
                conversations={conversations}
                formId={formId}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      <div className="max-lg:hidden">
        <div className="mb-5">
          <MainNavTab formId={formId} />
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
        <div className="text-muted-foreground mb-2 px-4 text-sm">
          Recent conversations
        </div>
        {isLoadingConversations || !formId ? (
          <ConversationsNavigation.ConversationsCardSkelton />
        ) : (
          <ConversationsNavigation
            conversations={conversations}
            formId={formId}
          />
        )}
      </div>
    </div>
  );
}

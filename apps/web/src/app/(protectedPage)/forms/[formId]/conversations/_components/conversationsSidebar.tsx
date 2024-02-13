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
import { List } from "lucide-react";

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
  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  const { isLoading, data } = api.conversation.getAll.useQuery({
    formId,
  });

  const isLoadingConversations = isLoading;
  const conversations = data ?? [];

  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  return (
    <div className="px-3">
      <div className="lg:hidden">
        <MainNavTab formId={formId} />
        <Sheet
          open={open}
          onOpenChange={(status) => setState((cs) => ({ ...cs, open: status }))}
        >
          <div className="flex justify-end py-3">
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <span>Conversation list</span>
                <List size={20} className="ml-2" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-[90%] ">
            <SheetClose />
            <div className="mb-3">
              <SecondaryNavigation
                items={[
                  { href: `/forms/${formId}/conversations`, title: "Overview" },
                ]}
              />
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

        <div className="mb-3">
          <SecondaryNavigation
            items={[
              {
                href: `/forms/${formId}/conversations`,
                title: "Overview",
              },
            ]}
          />
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

"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "@/lib/store/formStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { ConversationsCard } from "./conversationsListCard";

type State = {
  open: boolean;
};

export default function ConversationsSidebar() {
  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  const pathname = usePathname();

  const formStore = useFormStore();
  const { conversations, formId, isLoadingConversations } = formStore;

  useEffect(() => {
    if (formId) {
      formStore.fetchConversations();
    }
  }, [formId]);

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  return (
    <>
      <div className="lg:hidden">
        <Sheet
          open={open}
          onOpenChange={(status) => setState((cs) => ({ ...cs, open: status }))}
        >
          <div className="p-3">
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-[90%] ">
            {isLoadingConversations || !formId ? (
              <ConversationsCard.ConversationsCardSkelton />
            ) : (
              <ConversationsCard
                conversations={conversations}
                formId={formId}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      <div className="max-lg:hidden min-w-[400px] w-[400px] px-3">
        {isLoadingConversations || !formId ? (
          <ConversationsCard.ConversationsCardSkelton />
        ) : (
          <ConversationsCard conversations={conversations} formId={formId} />
        )}
      </div>
    </>
  );
}

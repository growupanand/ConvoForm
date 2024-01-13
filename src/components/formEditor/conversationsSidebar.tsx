"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFormStore } from "@/lib/store/formStore";
import { Button } from "../ui/button";
import { ConversationsCard } from "./conversationsListCard";
import NavLinks from "./navLinks";

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
    <div className="px-3">
      <div className="lg:hidden">
        <NavLinks />
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
            <SheetClose />
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
      <div className="max-lg:hidden">
        <NavLinks />
        {isLoadingConversations || !formId ? (
          <ConversationsCard.ConversationsCardSkelton />
        ) : (
          <ConversationsCard conversations={conversations} formId={formId} />
        )}
      </div>
    </div>
  );
}

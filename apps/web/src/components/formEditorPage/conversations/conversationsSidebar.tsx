"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@convoform/ui/components/ui/sheet";
import { sendErrorResponseToast } from "@convoform/ui/components/ui/use-toast";
import { useAtom } from "jotai";
import { Menu } from "lucide-react";

import {
  conversationsAtom,
  isLoadingConversationsAtom,
} from "@/lib/atoms/formAtoms";
import { getFormConversationsController } from "@/lib/controllers/form";
import NavLinks from "../navLinks";
import { ConversationsCard } from "./conversationsListCard";

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

  const [isLoadingConversations, setIsLoadingConversations] = useAtom(
    isLoadingConversationsAtom,
  );
  const [conversations, setConversations] = useAtom(conversationsAtom);
  const { conversationId } = useParams();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setIsLoadingConversations(true);
      setConversations([]);
      if (formId) {
        try {
          const conversations = await getFormConversationsController(formId);
          setConversations(conversations);
          setIsLoadingConversations(false);
          if (conversations.length > 0 && !conversationId) {
            router.replace(
              `/forms/${formId}/conversations/${conversations[0].id}`,
            );
          }
        } catch (error) {
          sendErrorResponseToast(error);
        }
      }
    })();
  }, [formId]);

  const pathname = usePathname();

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

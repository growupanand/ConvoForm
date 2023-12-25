"use client";

import { ConversationDetailLoading } from "@/components/conversationDetailLoading";
import { useFormStore } from "@/lib/store/formStore";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ConversationPage() {
  const formStore = useFormStore();
  const { form, conversations } = formStore;
  useEffect(() => {
    if (conversations.length > 0) {
      redirect(`/forms/${form?.id}/conversations/${conversations[0].id}`);
    }
  }, [conversations]);
  return null;
}

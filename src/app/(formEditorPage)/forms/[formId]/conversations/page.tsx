"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

import { useFormStore } from "@/lib/store/formStore";

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

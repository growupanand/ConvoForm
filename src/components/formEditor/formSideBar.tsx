"use client";

import FormEditorCard from "@/components/formEditor/formEditorCard";
import { useFormEditorContext } from "@/app/(formEditorPage)/context";
import ConversationsCard from "./conversationsCard";

export default function FormSideBar() {
  const { form, navLinks, activeLink } = useFormEditorContext();

  return (
    <>
      {activeLink?.label === "Editor" && <FormEditorCard />}
      {activeLink?.label === "Conversations" && <ConversationsCard />}
    </>
  );
}

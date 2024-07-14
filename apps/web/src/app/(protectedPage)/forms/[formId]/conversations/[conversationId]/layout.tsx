import type { Metadata } from "next";

import { getOrganizationId } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";
import NotFound from "./not-found";

type Props = {
  children: React.ReactNode;
  params: { conversationId: string };
};

export const metadata: Metadata = {
  title: "Conversation page",
};

export default async function Layout({
  children,
  params: { conversationId },
}: Readonly<Props>) {
  const orgId = getOrganizationId();

  const conversation = await api.conversation.getOne({ id: conversationId });

  if (!conversation || conversation.organizationId !== orgId) {
    return <NotFound />;
  }

  return children;
}

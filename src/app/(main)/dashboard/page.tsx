import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { DataCard } from "@/components/dashboard/dataCard";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

const getForms = async (organizationId: string) => {
  return prisma.form.findMany({
    where: {
      organizationId: organizationId,
    },
  });
};

const getConversations = async (organizationId: string) => {
  return prisma.conversation.findMany({
    where: {
      organizationId: organizationId,
    },
  });
};

export default async function DashboardPage() {
  const { orgId } = auth();
  if (!orgId) {
    notFound();
  }
  const forms = await getForms(orgId);
  const formsCount = forms.length;
  const lastFormCreatedAt =
    formsCount !== 0 ? timeAgo(forms[formsCount - 1].createdAt) : null;
  const conversations = await getConversations(orgId);
  const conversationsCount = conversations.length;
  const lastConversationCreatedAt =
    conversationsCount !== 0
      ? timeAgo(conversations[conversationsCount - 1].createdAt)
      : null;

  return (
    <div>
      <h1 className="mb-5 py-3 text-xl font-medium">Dashboard</h1>
      <div className="grid gap-3 lg:grid-cols-4">
        <DataCard
          title="Forms created"
          mainValue={formsCount.toString()}
          secondaryValue={
            lastFormCreatedAt ? `Last ${lastFormCreatedAt}` : undefined
          }
        />
        <DataCard
          title="Response collected"
          mainValue={conversationsCount.toString()}
          secondaryValue={
            lastConversationCreatedAt
              ? `Last ${lastConversationCreatedAt}`
              : undefined
          }
        />
      </div>
    </div>
  );
}

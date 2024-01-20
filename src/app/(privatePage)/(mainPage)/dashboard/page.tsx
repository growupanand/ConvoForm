import { Metadata } from "next";

import { DataCard } from "@/components/mainPage/dashboard/dataCard";
import { prisma } from "@/lib/db";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

const getFormsCount = async (organizationId: string) => {
  return prisma.form.count({
    where: {
      organizationId: organizationId,
    },
  });
};

const getLastForm = async (organizationId: string) => {
  return prisma.form.findFirst({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });
};

const getConversationsCount = async (organizationId: string) => {
  return prisma.conversation.count({
    where: {
      organizationId: organizationId,
    },
  });
};

const getLastConversation = async (organizationId: string) => {
  return prisma.conversation.findFirst({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });
};

export default async function DashboardPage() {
  const orgId = getOrganizationId();

  const formsCount = await getFormsCount(orgId);
  let lastFormCreatedAt = null as string | null;
  if (formsCount > 0) {
    const lastForm = await getLastForm(orgId);
    lastFormCreatedAt = lastForm ? timeAgo(lastForm.createdAt) : null;
  }

  const conversationsCount = await getConversationsCount(orgId);
  let lastConversationCreatedAt = null as string | null;
  if (conversationsCount > 0) {
    const lastConversation = await getLastConversation(orgId);
    lastConversationCreatedAt = lastConversation
      ? timeAgo(lastConversation.createdAt)
      : null;
  }

  return (
    <div>
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
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

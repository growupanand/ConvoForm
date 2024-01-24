import { Metadata } from "next";

import { DataCard } from "@/components/mainPage/dashboard/dataCard";
import { prisma } from "@/lib/db";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

const getTotalFormsCount = async (organizationId: string) => {
  return prisma.form.count({
    where: {
      organizationId: organizationId,
    },
  });
};

const getLastCreatedForms = async (
  organizationId: string,
  lastDaysCount: number,
) => {
  const lastDaysDate = new Date();
  lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
  return prisma.form.findMany({
    where: {
      organizationId: organizationId,
      createdAt: {
        gte: lastDaysDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });
};

const getTotalConversationsCount = async (organizationId: string) => {
  return prisma.conversation.count({
    where: {
      organizationId: organizationId,
    },
  });
};

const getLastCreatedConversations = async (
  organizationId: string,
  lastDaysCount: number,
) => {
  const lastDaysDate = new Date();
  lastDaysDate.setDate(lastDaysDate.getDate() - lastDaysCount);
  return prisma.conversation.findMany({
    where: {
      organizationId: organizationId,
      createdAt: {
        gte: lastDaysDate,
      },
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

  const currentMonthTotalDays = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  // get array of day of lastDaysLength days,
  // E.g if today is 24 then [24, 23, 22, 21, 20, 19, 18]
  const lastDays = Array.from(
    { length: currentMonthTotalDays },
    (_, i) => currentMonthTotalDays - i,
  );

  const formsTotalCount = await getTotalFormsCount(orgId);
  const lastCreatedForms = await getLastCreatedForms(
    orgId,
    currentMonthTotalDays,
  );
  let lastFormCreatedAt = null;
  if (lastCreatedForms.length > 0) {
    const lastForm = lastCreatedForms[0];
    lastFormCreatedAt = lastForm ? timeAgo(lastForm.createdAt) : null;
  }
  const formCountsDataDayWise = {} as Record<string, any>;
  lastDays.forEach((day) => {
    formCountsDataDayWise[day] = 0;
  });
  for (let i = 0; i < lastCreatedForms.length; i++) {
    const form = lastCreatedForms[i];
    const formCreatedAtDay = form.createdAt.getDate();
    formCountsDataDayWise[formCreatedAtDay] += 1;
  }
  const formCountDataArray = Object.entries(formCountsDataDayWise).map(
    ([name, value]) => ({
      name,
      count: value,
    }),
  );

  const totalConversationsCount = await getTotalConversationsCount(orgId);
  const lastCreatedConversations = await getLastCreatedConversations(
    orgId,
    currentMonthTotalDays,
  );
  let lastConversationCreatedAt = null;
  if (lastCreatedConversations.length > 0) {
    const lastConversation = lastCreatedConversations[0];
    lastConversationCreatedAt = lastConversation
      ? timeAgo(lastConversation.createdAt)
      : null;
  }

  const conversationsCountDataDayWise = {} as Record<string, any>;
  lastDays.forEach((day) => {
    conversationsCountDataDayWise[day] = 0;
  });
  for (let i = 0; i < lastCreatedConversations.length; i++) {
    const conversation = lastCreatedConversations[i];
    const conversationCreatedAtDay = conversation.createdAt.getDate();
    conversationsCountDataDayWise[conversationCreatedAtDay] += 1;
  }
  const conversationCountDataArray = Object.entries(
    conversationsCountDataDayWise,
  ).map(([name, value]) => ({
    name,
    count: value,
  }));

  return (
    <div className="max-lg:p-3">
      <h1 className="mb-5 py-3 text-xl font-medium lg:text-2xl">Dashboard</h1>
      <div className="grid gap-3 lg:grid-flow-col">
        <DataCard
          title="Forms created"
          mainValue={formsTotalCount.toString()}
          secondaryValue={
            lastFormCreatedAt ? `Last ${lastFormCreatedAt}` : undefined
          }
          dataType="Total"
          chartData={formCountDataArray}
        />
        <DataCard
          title="Response collected"
          mainValue={totalConversationsCount.toString()}
          secondaryValue={
            lastConversationCreatedAt
              ? `Last ${lastConversationCreatedAt}`
              : undefined
          }
          dataType="Total"
          chartData={conversationCountDataArray}
        />
      </div>
    </div>
  );
}

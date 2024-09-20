"use client";

import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@convoform/ui/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { montserrat } from "@/app/fonts";
import type { NavLink } from "@/lib/types/navigation";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
  organizationId: string;
};

export default function MainNavTab({
  formId,
  organizationId,
}: Readonly<Props>) {
  const pathName = usePathname();
  const currentFormId = formId;
  const isAlreadyOnConversationsPage = pathName.includes("conversations");

  const { data: formsWithConversationsCount } =
    api.conversation.getCountByFormIds.useQuery({
      formIds: [currentFormId],
      organizationId,
    });

  const conversationsCount =
    formsWithConversationsCount?.[0]?.conversationCount ?? 0;

  const tabLinks = [
    {
      path: `/forms/${currentFormId}`,
      name: "Editor",
      isActive: pathName === `/forms/${currentFormId}`,
    },
    {
      name: `Responses ${conversationsCount}`,
      path: isAlreadyOnConversationsPage
        ? ""
        : `/forms/${currentFormId}/conversations`,
      isActive: isAlreadyOnConversationsPage,
    },
  ] as NavLink[];

  const activeTab = tabLinks.find((link) => link.isActive);

  return (
    <Tabs value={activeTab?.name} className="w-full py-3">
      <TabsList className="grid w-full grid-cols-2">
        {tabLinks.map((link) => (
          <TabsTrigger
            value={link.name}
            key={`${link.path}-${link.name}`}
            className={montserrat.className}
            asChild
            disabled={link.disabled}
          >
            <Link href={link.path}>{link.name}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

const MainNavTabSkeleton = () => {
  return (
    <div className="w-full py-3">
      <div className="grid h-8 grid-cols-2 gap-1">
        <Skeleton className=" w-full" />
        <Skeleton className="w-full" />
      </div>
    </div>
  );
};

MainNavTab.Skeleton = MainNavTabSkeleton;

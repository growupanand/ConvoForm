"use client";

import { Skeleton } from "@convoform/ui";
import { Tabs, TabsList, TabsTrigger } from "@convoform/ui";
import { usePathname } from "next/navigation";

import { api } from "@/trpc/react";
import Link from "next/link";

type Props = {
  formId: string;
  organizationId: string;
};

export type NavLink = {
  link: string;
  name: string;
  isActive?: boolean;
  getIsActive?: (link: string) => boolean;
  disabled?: boolean;
  activeClassName?: string;
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
      link: `/forms/${currentFormId}`,
      name: "Editor",
      isActive: pathName === `/forms/${currentFormId}`,
    },
    {
      name: `Responses ${conversationsCount}`,
      link: `/forms/${currentFormId}/conversations`,
      isActive: isAlreadyOnConversationsPage,
    },
  ] as NavLink[];

  const activeTab = tabLinks.find((link) => link.isActive);

  return (
    <Tabs value={activeTab?.name} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        {tabLinks.map((link) => (
          <TabsTrigger
            value={link.name}
            key={`${link.link}-${link.name}`}
            className="font-montserrat"
            asChild
            disabled={link.disabled}
          >
            <Link href={link.link}>{link.name}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

const MainNavTabSkeleton = () => {
  return (
    <div className="w-full py-3">
      <div className="grid h-8 grid-cols-2 gap-4">
        <Skeleton className=" w-full" />
        <Skeleton className="w-full" />
      </div>
    </div>
  );
};

MainNavTab.Skeleton = MainNavTabSkeleton;

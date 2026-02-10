"use client";

import { Skeleton } from "@convoform/ui";
import { Tabs, TabsList, TabsTrigger } from "@convoform/ui";
import { usePathname } from "next/navigation";

import Link from "next/link";

type Props = {
  formId: string;
};

export type NavLink = {
  link: string;
  name: string;
  isActive?: boolean;
  getIsActive?: (link: string) => boolean;
  disabled?: boolean;
  activeClassName?: string;
};

export default function MainNavTab({ formId }: Readonly<Props>) {
  const pathName = usePathname();
  const currentFormId = formId;
  const isAlreadyOnConversationsPage = pathName.includes("conversations");

  const tabLinks = [
    {
      link: `/forms/${currentFormId}`,
      name: "Editor",
      isActive: pathName === `/forms/${currentFormId}`,
    },
    {
      name: "Responses",
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

export const MainNavTabSkeleton = () => {
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

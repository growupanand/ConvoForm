"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@convoform/ui/components/ui/tabs";
import { useAtom } from "jotai";

import { montserrat } from "@/app/fonts";
import { currentFormAtom } from "@/lib/atoms/formAtoms";
import { NavLink } from "@/lib/types/navigation";

export default function NavLinks() {
  const pathName = usePathname();
  const [currentForm] = useAtom(currentFormAtom);
  const currentFormId = currentForm?.id;
  const isAlreadyOnConversationsPage = pathName.includes(`conversations`);

  const tabLinks = [
    {
      path: `/forms/${currentForm?.id}`,
      name: "Editor",
      isActive: pathName === `/forms/${currentFormId}`,
      disabled: !currentForm,
    },
    {
      name: "Conversations",
      path: isAlreadyOnConversationsPage
        ? ""
        : `/forms/${currentFormId}/conversations`,
      isActive: isAlreadyOnConversationsPage,
      disabled: !currentForm,
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

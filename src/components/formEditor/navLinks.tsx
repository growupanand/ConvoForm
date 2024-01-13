"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { montserrat } from "@/app/fonts";
import { NavLink } from "@/lib/types/navLink";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export default function NavLinks() {
  const pathName = usePathname();
  const { formId } = useParams();
  const navLinks = [
    {
      label: "Editor",
      href: `/forms/${formId}`,
      isActive: pathName === `/forms/${formId}`,
    },
    {
      label: "Conversations",
      href: `/forms/${formId}/conversations`,
      isActive: pathName.includes(`/forms/${formId}/conversations`),
    },
  ] as NavLink[];

  const activeLinkLabel = navLinks.find((link) => link.isActive)?.label;

  return (
    <Tabs value={activeLinkLabel} className="w-full py-3">
      <TabsList className="grid w-full grid-cols-2">
        {navLinks.map((link) => (
          <TabsTrigger
            value={link.label}
            key={link.href}
            className={montserrat.className}
            asChild
          >
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

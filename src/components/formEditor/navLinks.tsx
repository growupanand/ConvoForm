"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Form } from "@prisma/client";

import { montserrat } from "@/app/fonts";
import { NavLink } from "@/lib/types/navLink";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type Props = {
  form: Form;
};

export default function NavLinks({ form }: Readonly<Props>) {
  const pathName = usePathname();
  const navLinks = [
    {
      label: "Editor",
      href: `/forms/${form.id}`,
      isActive: pathName === `/forms/${form.id}`,
    },
    {
      label: "Conversations",
      href: `/forms/${form.id}/conversations`,
      isActive: pathName.includes(`/forms/${form.id}/conversations`),
    },
  ] as NavLink[];

  const activeLinkLabel = navLinks.find((link) => link.isActive)?.label;

  return (
    <Tabs value={activeLinkLabel}>
      <TabsList>
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <TabsTrigger
              value={link.label}
              key={link.href}
              className={montserrat.className}
            >
              {link.label}
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}

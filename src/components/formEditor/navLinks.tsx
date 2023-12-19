"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { NavLink } from "@/lib/types/navLink";
import { Form } from "@prisma/client";

type Props = {
  form: Form;
};

export default function NavLinks({ form }: Props) {
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
      isActive: pathName === `/forms/${form.id}/conversations`,
    },
  ] as NavLink[];

  return (
    <>
      {navLinks.map((link) => (
        <Link className="flex-1" href={link.href} key={link.href}>
          <Button
            className="w-full"
            variant={link.isActive ? "secondary" : "ghost"}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </>
  );
}

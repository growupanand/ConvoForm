"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string | React.ReactNode;
  }[];
  heading?: string;
}

export function SidebarNav({
  className,
  items,
  heading,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div>
      {heading && (
        <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {heading}
        </h3>
      )}
      <nav className={cn("flex flex-col gap-1", className)} {...props}>
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}

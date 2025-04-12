"use client";

import { Button } from "@convoform/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type SecondaryNavigationItem = {
  href: string;
  title: string | React.ReactNode;
  icon?: React.ReactNode;
};

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SecondaryNavigationItem[];
  heading?: string;
}

export function SecondaryNavigation({
  className,
  items,
  heading,
  ...props
}: Readonly<SidebarNavProps>) {
  const pathname = usePathname();

  return (
    <div>
      {heading && (
        <h3 className="mb-2 px-3 text-base font-medium tracking-tight ">
          {heading}
        </h3>
      )}
      <nav className={cn("flex flex-col gap-1", className)} {...props}>
        {items.map((item) => (
          <Link href={item.href} key={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                " w-full justify-start font-normal",
                pathname === item.href && "font-medium",
              )}
              size="sm"
            >
              {item.icon && <span className="me-2">{item.icon}</span>}
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}

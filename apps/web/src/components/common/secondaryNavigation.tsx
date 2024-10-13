"use client";

import { Button } from "@convoform/ui/components/ui/button";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string | React.ReactNode;
  }[];
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
        <h3 className="mb-5 px-4 text-lg font-medium tracking-tight ">
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
            >
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}

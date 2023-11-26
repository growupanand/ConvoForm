"use client";

import { User } from "next-auth";
import BrandName from "./brandName";
import LogOutButton from "./logoutButton";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { appNavbarConfig } from "@/config/appNavBarConfig";

type Props = {
  user: Omit<User, "id">;
};

export default function AppNavbar({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col justify-between p-5">
      <div>
        <div className="mb-5">
          <BrandName />
        </div>
        <div className="grid">
          {appNavbarConfig.dashboardLinks.map((link) => (
            <Link href={link.href} key={link.name + link.href}>
              <Button
                variant="link"
                className={cn(
                  "w-full justify-start hover:no-underline text-gray-500 hover:text-gray-800",
                  link.href === pathname && "text-gray-800"
                )}
              >
                {link.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="text-sm font-semibold">{user.name}</div>
        <LogOutButton />
      </div>
    </nav>
  );
}

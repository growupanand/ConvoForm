"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import BrandName from "../brandName";
import Link from "next/link";
import { Button } from "../ui/button";
import { LayoutDashboard } from "lucide-react";

export function Header() {
  const { user } = useUser();

  return (
    <nav className="flex justify-between items-center p-3 w-full">
      <BrandName className="text-xl lg:text-2xl" />
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/dashboard">
              <Button variant="secondary">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </Link>
            <UserButton />
          </>
        ) : (
          <Link href="/auth/sign-in">
            <Button variant="secondary" className="rounded-full">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";

import BrandName from "../brandName";
import { Button } from "../ui/button";

export function Header() {
  const { user } = useUser();

  return (
    <header>
      <div className="flex w-full items-center justify-between p-3">
        <BrandName className="text-xl lg:text-2xl" />
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <Link href="/auth/sign-in" rel="noopener noreferrer nofollow">
              <Button variant="secondary" className="rounded-full">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

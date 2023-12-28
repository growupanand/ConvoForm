"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import BrandName from "../brandName";
import Link from "next/link";
import { Button } from "../ui/button";

export function Header() {
  const { user } = useUser();

  return (
    <nav className="flex justify-between items-center p-3 mt-5 w-full">
      <BrandName />
      <div className="flex items-center gap-3">
        {user ? (
          <div>
            <Link href="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
            <UserButton />
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/auth/sign-in">
              <Button variant="secondary" className="rounded-full">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

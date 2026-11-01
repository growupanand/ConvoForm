"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { AuthProvider } from "@/components/authProvider";
import { SignInButton } from "@/components/common/publicLayout/signInButton";

export function UserSignInButton() {
  return (
    <AuthProvider>
      <ClerkLoading>
        <SignInButton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium text-marketing-muted transition-colors duration-150 hover:text-marketing-ink"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              <span className="max-[899px]:hidden">Dashboard</span>
            </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </ClerkLoaded>
    </AuthProvider>
  );
}

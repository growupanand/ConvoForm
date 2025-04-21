"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@convoform/ui";
import { LayoutDashboard } from "lucide-react";

import { AuthProvider } from "@/components/authProvider";
import { SignInButton } from "@/components/common/publicLayout/signInButton";
import Link from "next/link";

export function UserSignInButton() {
  return (
    <AuthProvider>
      <ClerkLoading>
        <SignInButton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <Link href="/dashboard">
            <Button variant="secondary">
              <LayoutDashboard className="" size={20} />
              <span className="ml-2 max-lg:hidden">Go to Dashboard</span>
            </Button>
          </Link>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </ClerkLoaded>
    </AuthProvider>
  );
}

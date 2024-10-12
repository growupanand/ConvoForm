"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { LayoutDashboard } from "lucide-react";

import { AuthProvider } from "@/components/authProvider";
import { LinkN } from "../../../components/common/linkN";
import { SignInButton } from "./signInButton";

export function UserSignInButton() {
  return (
    <AuthProvider>
      <ClerkLoading>
        <Skeleton className="h-10 w-10 animate-pulse rounded-full" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <LinkN href="/dashboard">
            <Button variant="secondary">
              <LayoutDashboard className="mr-2" size={20} /> Go to Dashboard
            </Button>
          </LinkN>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </ClerkLoaded>
    </AuthProvider>
  );
}

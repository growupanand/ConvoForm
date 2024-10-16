"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { LayoutDashboard } from "lucide-react";

import { AuthProvider } from "@/components/authProvider";
import { LinkN } from "../../../components/common/linkN";
import { SignInButton } from "./signInButton";

export function UserSignInButton() {
  return (
    <AuthProvider>
      <ClerkLoading>
        <SignInButton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <LinkN href="/dashboard">
            <Button variant="secondary">
              <LayoutDashboard className="" size={20} />
              <span className="ml-2 max-lg:hidden">Go to Dashboard</span>
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

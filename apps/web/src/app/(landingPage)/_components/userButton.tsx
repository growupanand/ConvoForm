"use client";

import { ClerkLoading, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { LayoutDashboard } from "lucide-react";

import { LinkN } from "../../../components/common/linkN";
import { SignInButton } from "./signInButton";

export default function UserSignInButton() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <LinkN href="/dashboard">
          <Button variant="secondary">
            <LayoutDashboard className="mr-2" size={20} /> Go to Dashboard
          </Button>
        </LinkN>
        <ClerkLoading>
          <Skeleton className="h-10 w-10 animate-pulse rounded-full" />
        </ClerkLoading>
        <UserButton />
      </>
    );
  }

  return <SignInButton />;
}

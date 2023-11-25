"use client";

import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { signOut, signIn } from "next-auth/react";

export default function LoginButton({ user }: { user?: Omit<User, "id"> }) {
  return (
    <div>
      {user ? (
        <Button onClick={() => signOut()}>Logout</Button>
      ) : (
        <Button onClick={() => signIn()}>Login</Button>
      )}
    </div>
  );
}

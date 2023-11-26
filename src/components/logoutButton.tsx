"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export default function LogOutButton() {
  return (
    <Button className="w-full" onClick={() => signOut()}>
      Logout
    </Button>
  );
}

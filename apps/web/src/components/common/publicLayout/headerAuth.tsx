"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { SignInButton } from "./signInButton";

const UserSignInButton = dynamic(
  () =>
    import("@/app/(public)/(landingPage)/_components/userButton").then(
      (module) => module.UserSignInButton,
    ),
  { ssr: false, loading: () => <SignInButton /> },
);

// Clerk is a large client bundle and the public header only needs it to show
// the signed-in dashboard/user button. Start with the plain sign-in link and
// load Clerk after the first real interaction, so it stays off the critical
// path for visitors arriving from Instagram or WhatsApp. Pointer events are
// deliberately excluded: a pointerdown on the sign-in link would swap the link
// out mid-click.
const INTERACTION_EVENTS = ["scroll", "keydown", "touchstart"] as const;

export function HeaderAuth() {
  const [loadClerk, setLoadClerk] = useState(false);

  useEffect(() => {
    const load = () => setLoadClerk(true);
    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, load, { once: true, passive: true });
    }
    return () => {
      for (const event of INTERACTION_EVENTS) {
        window.removeEventListener(event, load);
      }
    };
  }, []);

  return loadClerk ? <UserSignInButton /> : <SignInButton />;
}

"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import Spinner from "@/components/common/spinner";
import { ContinueOnDesktop } from "./continueOnDesktop";
import { DesktopOnlyAlert } from "./desktopOnlyAlert";

export function MobileGate() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    posthog.capture("mobileHandoff:view", {
      pathname,
      isSignedIn: Boolean(isSignedIn),
    });
  }, [isLoaded, isSignedIn, pathname, posthog]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isSignedIn) {
    return <ContinueOnDesktop />;
  }

  return <DesktopOnlyAlert />;
}

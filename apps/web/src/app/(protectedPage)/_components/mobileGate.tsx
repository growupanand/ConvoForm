"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import { BrandLogo } from "@/components/common/brandLogo";
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
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6">
        <BrandLogo variant="mark" size={32} />
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isSignedIn) {
    return <ContinueOnDesktop />;
  }

  return <DesktopOnlyAlert />;
}

"use client";

import { useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";

export function OrganizationViewAnalytics() {
  const { user } = useUser();
  const posthog = usePostHog();
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || hasCapturedRef.current) {
      return;
    }
    hasCapturedRef.current = true;
    posthog.capture("organization:view");
  }, [user?.id, posthog]);

  return null;
}

"use client";

import { useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";

export function PosthogUserInit() {
  const { user } = useUser();
  const posthog = usePostHog();
  const previousClerkUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const clerkUserId = user?.id ?? null;
    const previousClerkUserId = previousClerkUserIdRef.current;

    if (clerkUserId === null) {
      if (previousClerkUserId !== null) {
        posthog.reset();
      }
      previousClerkUserIdRef.current = null;
      return;
    }

    if (previousClerkUserId !== null && previousClerkUserId !== clerkUserId) {
      posthog.reset();
    }

    if (!user) {
      return;
    }

    const userDetails: Record<string, string> = {};
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) {
      userDetails.email = email;
    }
    if (user.fullName) {
      userDetails.name = user.fullName;
    }
    if (user.hasImage && user.imageUrl) {
      userDetails.imageUrl = user.imageUrl;
    }

    posthog.identify(clerkUserId, userDetails);
    previousClerkUserIdRef.current = clerkUserId;
  }, [user, posthog]);

  return null;
}

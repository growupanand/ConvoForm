"use client";

import { useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export function PosthogUserInit() {
  const { user } = useUser();
  const posthog = usePostHog();

  useEffect(() => {
    if (user) {
      const userDetails = {} as Record<string, string>;

      if (user.fullName) {
        userDetails.fullName = user.fullName;
      }

      if (user.hasImage && user.imageUrl) {
        userDetails.imageUrl = user.imageUrl;
      }

      posthog.identify(
        user.primaryEmailAddress?.emailAddress ?? user.id,
        userDetails,
      );
    }
    return () => {
      posthog.reset();
    };
  }, [user]);

  return null;
}

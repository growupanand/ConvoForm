"use client";

import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";

export function SentryUserInit() {
  const { user } = useUser();

  if (user) {
    Sentry.setUser({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      fullName: `${user.firstName} ${user.lastName}`,
    });
  }
  return null;
}

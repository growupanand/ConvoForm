// app/providers.js
"use client";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { SuspendedPostHogPageView } from "./PostHogPageView";

const MARKETING_ROUTES = [
  "/",
  "/use-cases",
  "/changelog",
  "/privacy",
  "/terms",
] as const;

const isMarketingPath = (pathname: string | null) => {
  if (!pathname) return false;
  return MARKETING_ROUTES.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`),
  );
};

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  const marketingRoute = isMarketingPath(window.location.pathname);

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true, // Enable automatic pageleave capture
    autocapture: false,
    // The recorder and surveys are large optional bundles. Marketing pages are
    // the first touch for ad and social traffic, so keep them off that load.
    disable_session_recording: marketingRoute,
    disable_surveys: marketingRoute,
  });
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;

    // A visitor who lands on a marketing page and then signs up should still be
    // recorded from the moment they leave the marketing route.
    if (!previous || !pathname) return;
    if (!isMarketingPath(previous) || isMarketingPath(pathname)) return;

    posthog.startSessionRecording();
    posthog.set_config({ disable_surveys: false });
  }, [pathname]);

  return (
    <PostHogProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PostHogProvider>
  );
}

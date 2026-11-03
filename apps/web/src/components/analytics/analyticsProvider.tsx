// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { SuspendedPostHogPageView } from "./PostHogPageView";

const MARKETING_ROUTES = [
  "/",
  "/use-cases",
  "/changelog",
  "/privacy",
  "/terms",
] as const;

const isMarketingRoute = () => {
  if (typeof window === "undefined") return false;
  const { pathname } = window.location;
  return MARKETING_ROUTES.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`),
  );
};

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  const marketingRoute = isMarketingRoute();

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
  return (
    <PostHogProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PostHogProvider>
  );
}

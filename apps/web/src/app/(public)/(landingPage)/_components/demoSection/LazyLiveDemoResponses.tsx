"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { ResponsesTableSkeleton } from "./responsesTableSkeleton";

// Lazy load the component
const LiveDemoResponsesComponent = dynamic(
  () =>
    import("./liveDemoResponses").then((mod) => ({
      default: mod.LiveDemoResponses,
    })),
  {
    ssr: false,
    loading: () => <ResponsesTableSkeleton />,
  },
);

// Wrapper component that handles lazy loading
export function LazyLiveDemoResponses() {
  const [isDesktop] = useMediaQuery("(min-width: 1024px)");

  // Only render on desktop
  if (!isDesktop) {
    return <ResponsesTableSkeleton />;
  }

  return <LiveDemoResponsesComponent />;
}

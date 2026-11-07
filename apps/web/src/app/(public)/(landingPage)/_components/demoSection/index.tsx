"use client";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DEMO_FORM_ID } from "../constants";
import { LazyLiveDemoResponses } from "./LazyLiveDemoResponses";
import { DemoResponsesShell } from "./demoResponsesShell";

const LazyDemoSectionCard = dynamic(
  () => import("./demoSectionCard").then((mod) => mod.DemoSectionCard),
  {
    loading: () => <DemoSectionSkeleton />,
  },
);

function useDesktopViewport() {
  // Start from the desktop layout, but render nothing until matchMedia has run
  // so phones never mount the demo or open a websocket.
  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setIsDesktop(mediaQuery.matches);
    };

    sync();
    setMounted(true);
    mediaQuery.addEventListener("change", sync);

    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return { isDesktop, mounted };
}

function DemoFormColumn() {
  const { data: formData, isLoading } = api.form.getOneWithFields.useQuery({
    id: DEMO_FORM_ID,
  });

  if (isLoading) {
    return <DemoSectionSkeleton />;
  }

  if (!formData) {
    return null;
  }

  return <LazyDemoSectionCard form={formData} />;
}

export const DemoSectionSkeleton = () => {
  return (
    <div className="flex h-full min-h-[600px] items-center justify-center">
      <Spinner size="lg" label="Initializing Demo" labelClassName="text-xl" />
    </div>
  );
};

function MobileDemoCta() {
  return (
    <div className="text-center">
      <p className="mx-auto max-w-[340px] font-body text-[17px] leading-[1.6] text-marketing-muted">
        See how a ConvoForm conversation feels.
      </p>
      <Link
        href={`/view/${DEMO_FORM_ID}`}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
      >
        Try a live form
      </Link>
    </div>
  );
}

export function DemoSection() {
  const { isDesktop, mounted } = useDesktopViewport();

  if (!mounted) {
    return null;
  }

  if (!isDesktop) {
    return <MobileDemoCta />;
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-10">
      <div className="min-h-[600px] min-w-0">
        <DemoFormColumn />
      </div>
      <div className="h-[600px] min-w-0">
        <DemoResponsesShell>
          <LazyLiveDemoResponses />
        </DemoResponsesShell>
      </div>
    </div>
  );
}

"use client";

import Spinner from "@/components/common/spinner";
import { SectionCard } from "@/components/sectionCard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { DEMO_FORM_ID } from "../constants";

const LazyDemoSectionCard = dynamic(
  () => import("./demoSectionCard").then((mod) => mod.DemoSectionCard),
  {
    loading: () => <DemoSectionSkeleton />,
  },
);

function DemoSectionInner() {
  const [isDesktop] = useMediaQuery("(min-width: 1024px)");

  const { data: formData, isLoading } = api.form.getOneWithFields.useQuery(
    {
      id: DEMO_FORM_ID,
    },
    {
      enabled: isDesktop,
    },
  );

  if (!isDesktop) {
    return null;
  }

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
    <div className="flex items-center justify-center h-full">
      <Spinner size="lg" label="Initializing Demo" labelClassName="text-xl" />
    </div>
  );
};

const DemoSectionContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center max-lg:hidden">
      {children}
    </div>
  );
};

export function DemoSection() {
  return (
    <DemoSectionContainer>
      <SectionCard>
        <DemoSectionInner />
      </SectionCard>
    </DemoSectionContainer>
  );
}

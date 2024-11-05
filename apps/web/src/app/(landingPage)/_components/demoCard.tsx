"use client";

import Spinner from "@/components/common/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { DEMO_FORM_ID } from "./constants";

const LazyFormDesignProvider = dynamic(() =>
  import("@/components/formViewer/formDesignContext").then(
    (mod) => mod.FormDesignProvider,
  ),
);

const LazyFormViewer = dynamic(() =>
  import("@/components/formViewer").then((mod) => mod.FormViewer),
);

export function DemoCard() {
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
    return <DemoCardSkeleton />;
  }

  if (!formData) {
    return null;
  }

  return (
    <LazyFormDesignProvider formId={DEMO_FORM_ID}>
      <LazyFormViewer form={formData} />
    </LazyFormDesignProvider>
  );
}

export const DemoCardSkeleton = () => {
  return <Spinner label="Loading demo" />;
};

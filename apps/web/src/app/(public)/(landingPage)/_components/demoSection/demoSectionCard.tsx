"use client";

import { FormContextProvider } from "@/components/formViewer/formContext";
import type { Form } from "@convoform/db/src/schema";
import { useInView } from "motion/react";
import { useRef } from "react";
import { DemoCollectedDataTable } from "./demoCollectedDataTable";
import { DemoFormCard } from "./demoFormCard";

function DemoSectionCardInner({ showResponses }: { showResponses: boolean }) {
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(demoSectionRef, {
    once: true,
  });
  return (
    <div className="relative flex justify-center gap-10" ref={demoSectionRef}>
      <DemoFormCard isInView={isInView} />
      {showResponses && (
        <div className="absolute -left-60 -top-10">
          <DemoCollectedDataTable isInView={isInView} />
        </div>
      )}
    </div>
  );
}

export function DemoSectionCard({
  form,
  showResponses = false,
}: Readonly<{
  form: Form;
  showResponses?: boolean;
}>) {
  return (
    <FormContextProvider form={form}>
      <DemoSectionCardInner showResponses={showResponses} />
    </FormContextProvider>
  );
}

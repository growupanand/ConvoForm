"use client";

import { FormContextProvider } from "@/components/formViewer/formContext";
import type { Form } from "@convoform/db/src/schema";
import { useInView } from "motion/react";
import { useRef } from "react";
import { DemoCollectedDataTable } from "./demoCollectedDataTable";
import { DemoFormCard } from "./demoFormCard";

function DemoSectionCardInner() {
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(demoSectionRef, {
    once: true,
  });
  return (
    <div className=" relative flex justify-center gap-10 " ref={demoSectionRef}>
      <DemoFormCard isInView={isInView} />
      <div className="absolute -right-40 -top-10">
        <DemoCollectedDataTable isInView={isInView} />
      </div>
    </div>
  );
}

export function DemoSectionCard({ form }: Readonly<{ form: Form }>) {
  return (
    <FormContextProvider form={form}>
      <DemoSectionCardInner />
    </FormContextProvider>
  );
}

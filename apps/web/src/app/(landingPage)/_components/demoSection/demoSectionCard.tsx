"use client";

import { FormContextProvider } from "@/components/formViewer/formContext";
import type { Form } from "@convoform/db/src/schema";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { DemoCollectedDataTable } from "./demoCollectedDataTable";
import { DemoFormCard } from "./demoFormCard";

function DemoSectionCardInner() {
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(demoSectionRef, {
    once: true,
  });
  return (
    <div className=" flex justify-center gap-10 " ref={demoSectionRef}>
      <DemoFormCard isInView={isInView} />
      <DemoCollectedDataTable isInView={isInView} />
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

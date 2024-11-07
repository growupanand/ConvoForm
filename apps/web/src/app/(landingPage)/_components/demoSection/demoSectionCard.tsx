"use client";

import { FormContextProvider } from "@/components/formViewer/formContext";
import type { Form } from "@convoform/db/src/schema";
import { DemoCollectedDataTable } from "./demoCollectedDataTable";
import { DemoFormCard } from "./demoFormCard";

function DemoSectionCardInner() {
  return (
    <div className=" gap-10 flex justify-center">
      <DemoFormCard />
      <DemoCollectedDataTable />
    </div>
  );
}

export function DemoSectionCard({ form }: Readonly<{ form: Form }>) {
  return (
    <FormContextProvider form={form} disableFetchFormDesign>
      <DemoSectionCardInner />
    </FormContextProvider>
  );
}

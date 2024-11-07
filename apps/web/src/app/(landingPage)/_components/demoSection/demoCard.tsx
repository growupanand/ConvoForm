"use client";

import BrowserWindow from "@/components/common/browserWindow";
import { FormViewer } from "@/components/formViewer";
import { FormContextProvider } from "@/components/formViewer/formContext";
import { getFrontendBaseUrl } from "@/lib/url";
import type { Form } from "@convoform/db/src/schema";
import { DEMO_FORM_ID } from "../constants";

const demoFormLink = `${getFrontendBaseUrl()}/view/${DEMO_FORM_ID}`;

function DemoSectionCardInner() {
  return (
    <div className="flex items-center justify-center">
      <DemoFormCard />
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

const DemoFormCard = () => {
  return (
    <div>
      <BrowserWindow link={demoFormLink} hideCopyButton>
        <div className="w-[800px] h-[600px] flex flex-col items-center justify-center">
          <FormViewer />
        </div>
      </BrowserWindow>
    </div>
  );
};

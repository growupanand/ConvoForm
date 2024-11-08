"use client";

import Spinner from "@/components/common/spinner";
import { useFormContext } from "@/components/formViewer/formContext";
import { useFormDesign } from "@/components/formViewer/formDesignContext";

type Props = {
  children: React.ReactNode;
};

export function FormDesignLayout({ children }: Readonly<Props>) {
  const { currentSection } = useFormContext();
  const { getCurrentSectionFormDesign, isLoadingFormDesign } = useFormDesign();

  const currentFormDesign = getCurrentSectionFormDesign(currentSection);
  const pageBackgroundColor = currentFormDesign.backgroundColor;

  return (
    <div
      style={{ background: pageBackgroundColor }}
      className="h-full transition-colors duration-500"
    >
      {isLoadingFormDesign ? <LoadingForm /> : children}
    </div>
  );
}

const LoadingForm = () => (
  <div className="h-full pt-10 flex items-center justify-center">
    <Spinner label="Initializing form" labelClassName="text-lg font-medium" />
  </div>
);

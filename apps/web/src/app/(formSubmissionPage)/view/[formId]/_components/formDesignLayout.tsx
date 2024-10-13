"use client";

import Spinner from "@/components/common/spinner";
import { useFormDesign } from "@/components/formViewer/formDesignContext";

type Props = {
  children: React.ReactNode;
};

export function FormDesignLayout({ children }: Readonly<Props>) {
  const { activeFormDesign, isLoadingFormDesign } = useFormDesign();
  const pageBackgroundColor = activeFormDesign.backgroundColor;

  return (
    <div
      style={{ background: pageBackgroundColor }}
      className="min-h-screen transition-colors duration-500"
    >
      {isLoadingFormDesign ? <LoadingForm /> : children}
    </div>
  );
}

const LoadingForm = () => (
  <div className="min-h-screen grid items-center justify-center">
    <Spinner label="Initializing form" labelClassName="text-lg font-medium" />
  </div>
);

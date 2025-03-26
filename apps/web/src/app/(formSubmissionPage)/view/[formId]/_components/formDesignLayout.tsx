"use client";

import Spinner from "@/components/common/spinner";
import { useFormContext } from "@/components/formViewer/formContext";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { AnimatePresence, motion } from "motion/react";

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
      className="absolute inset-0  transition-colors duration-500"
    >
      <AnimatePresence mode="wait">
        {isLoadingFormDesign ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            layout={isLoadingFormDesign}
            className="w-full h-full flex items-center justify-center"
          >
            <LoadingForm />
          </motion.div>
        ) : (
          children
        )}
      </AnimatePresence>
    </div>
  );
}

const LoadingForm = () => (
  <Spinner label="Initializing form" labelClassName="text-lg font-medium" />
);

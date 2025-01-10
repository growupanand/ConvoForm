"use client";

import Spinner from "@/components/common/spinner";
import { useFormContext } from "@/components/formViewer/formContext";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { AnimatePresence, motion } from "framer-motion";

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
      <AnimatePresence mode="wait">
        {isLoadingFormDesign ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            layout={isLoadingFormDesign}
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
  <div className=" pt-10 flex items-center justify-center">
    <Spinner label="Initializing form" labelClassName="text-lg font-medium" />
  </div>
);

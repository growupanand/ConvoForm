"use client";

import { CollectedDataTable } from "@/app/(protectedPage)/forms/[formId]/conversations/_components/collectedDataTable";
import { useFormContext } from "@/components/formViewer/formContext";

import { type Variants, motion } from "framer-motion";

const tableAnimationVariants: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
      duration: 1,
      delay: 0.5,
    },
  },
};

export function DemoCollectedDataTable({ isInView: _ }: { isInView: boolean }) {
  const {
    convoFormHook: { collectedData = [], isConversationStarted },
  } = useFormContext();

  const showTable = isConversationStarted && collectedData.length > 0;

  if (!showTable) return null;

  if (showTable) {
    return (
      <motion.div
        variants={tableAnimationVariants}
        initial="hidden"
        viewport={{ once: true }}
        whileInView="visible"
      >
        <div className="min-w-[250px] max-w-[400px] shadow-xl overflow-hidden rounded-3xl border bg-white/40 p-2 backdrop-blur-lg">
          <CollectedDataTable collectedData={collectedData} />
        </div>
      </motion.div>
    );
  }
}

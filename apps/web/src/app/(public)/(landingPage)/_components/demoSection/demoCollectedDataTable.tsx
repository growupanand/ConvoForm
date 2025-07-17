"use client";

import { CollectedDataTable } from "@/components/collectedDataTable";
import { useFormContext } from "@/components/formViewer/formContext";
import { Activity } from "lucide-react";
import { type Variants, motion } from "motion/react";

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
        className="relative"
      >
        <div className="absolute -top-8 -left-0 text-brand-600 flex items-center gap-2">
          <Activity className="size-4" />
          <span className="font-medium text-lg">Live Response Data</span>
        </div>

        <div className="min-w-[250px] max-w-[400px] shadow-xl overflow-hidden rounded-3xl border bg-white/50 p-2 backdrop-blur-lg ring-2 ring-brand-200">
          <CollectedDataTable collectedData={collectedData} />
        </div>
      </motion.div>
    );
  }
}

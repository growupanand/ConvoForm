"use client";

import { CollectedDataTable } from "@/components/collectedDataTable";
import { useFormContext } from "@/components/formViewer/formContext";
import { ArrowDownRight } from "lucide-react";
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
        <motion.div
          className="absolute -top-12 -left-6 text-brand-500 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ArrowDownRight className="size-5" />
          <span className="font-medium text-sm">Current Response</span>
        </motion.div>

        <div className="min-w-[250px] max-w-[400px] shadow-xl overflow-hidden rounded-3xl border bg-white/50 p-2 backdrop-blur-lg ring-2 ring-brand-200">
          <CollectedDataTable collectedData={collectedData} />
        </div>
      </motion.div>
    );
  }
}

"use client";

import { Button } from "@convoform/ui";
import { Progress } from "@convoform/ui";
import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { ConfirmAction } from "../common/confirmAction";

export function TopProgressBar({
  totalProgress,
  onReset,
}: { totalProgress: number; onReset: () => void }) {
  return (
    <div className="w-full py-4 pe-3">
      <div className="flex items-center gap-6">
        <ConfirmAction
          onConfirm={onReset}
          title="Start form over?"
          description="This will start the form from the beginning, and any progress you have made will be lost."
          confirmText="Reset form"
        >
          <motion.span layoutId="start-conversation">
            <Button variant="ghost" size="sm">
              <RotateCcw className="size-4 me-2" />
              Start over
            </Button>
          </motion.span>
        </ConfirmAction>
        <motion.div
          initial={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          transition={{ duration: 1, delay: 1 }}
          className="w-full"
        >
          <Progress value={totalProgress} className="w-full h-1 shadow-sm" />
        </motion.div>
      </div>
    </div>
  );
}

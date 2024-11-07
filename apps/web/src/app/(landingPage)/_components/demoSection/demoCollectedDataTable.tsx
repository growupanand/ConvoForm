"use client";

import { CollectedDataTable } from "@/app/(protectedPage)/forms/[formId]/conversations/_components/collectedDataTable";
import { useFormContext } from "@/components/formViewer/formContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { type Variants, animate, motion, stagger } from "framer-motion";
import { useEffect } from "react";

const textAnimationVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const tableAnimationVariants: Variants = {
  hidden: { scale: 0.8 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
};

export function DemoCollectedDataTable({ isInView }: { isInView: boolean }) {
  const {
    convoFormHook: { collectedData = [], isConversationStarted },
  } = useFormContext();

  const showTable = isConversationStarted && collectedData.length > 0;

  useEffect(() => {
    if (isInView) {
      setTimeout(
        () =>
          animate(".animated-text", textAnimationVariants.visible, {
            delay: stagger(0.2),
          }),
        2000,
      );
    }
  }, [isInView]);

  return (
    <div>
      <Card className="w-[400px] min-h-[250px] bg-transparent border-none shadow-none">
        <motion.div
          variants={textAnimationVariants}
          initial="hidden"
          className="animated-text"
        >
          <CardHeader>
            <CardTitle className="text-center">Form response</CardTitle>
          </CardHeader>
        </motion.div>
        <CardContent>
          {!showTable && (
            <motion.p
              className="text-muted-foreground text-lg animated-text"
              variants={textAnimationVariants}
              initial="hidden"
            >
              Try filling form to see live collected data here
            </motion.p>
          )}
          {showTable && (
            <motion.div
              variants={tableAnimationVariants}
              initial="hidden"
              viewport={{ once: true }}
              whileInView="visible"
            >
              <CollectedDataTable collectedData={collectedData} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

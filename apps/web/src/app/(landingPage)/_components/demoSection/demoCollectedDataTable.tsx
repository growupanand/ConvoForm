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
import { Redo } from "lucide-react";
import { useEffect } from "react";

const textAnimationVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

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
        1500,
      );
    }
  }, [isInView]);

  return (
    <div className="flex items-start gap-4">
      <motion.div
        className="text-muted-foreground text-xl text-nowrap animated-text"
        variants={textAnimationVariants}
        initial="hidden"
      >
        <Redo className="size-10 text-muted-foreground" />
      </motion.div>
      <div>
        {!showTable && (
          <motion.p
            className="text-muted-foreground text-xl text-nowrap animated-text"
            variants={textAnimationVariants}
            initial="hidden"
          >
            Try demo form to see live parsed data
          </motion.p>
        )}
        {showTable && (
          <motion.div
            variants={tableAnimationVariants}
            initial="hidden"
            viewport={{ once: true }}
            whileInView="visible"
          >
            <Card className="w-[400px] ">
              {/* <motion.div
              variants={textAnimationVariants}
              initial="hidden"
              className="animated-text"
            > */}
              <CardHeader>
                <CardTitle className="">Form response</CardTitle>
              </CardHeader>
              {/* </motion.div> */}
              <CardContent>
                <CollectedDataTable collectedData={collectedData} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

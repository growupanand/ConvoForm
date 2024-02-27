"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AspectRatio } from "@convoform/ui/components/ui/aspect-ratio";
import { motion, useAnimate, useInView } from "framer-motion";

export function NewFeature() {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  const initializeAnimation = async () => {
    if (isInView) {
      animate(
        scope.current,
        { scale: 1 },
        { duration: 0.8, type: "spring", bounce: 0.5, delay: 0.2 },
      );
    }
  };

  useEffect(() => {
    initializeAnimation();
  }, [isInView]);

  return (
    <motion.div ref={scope} initial={{ scale: 0 }} className="hover:rotate-0">
      <div className="grid gap-5 lg:grid-cols-3 lg:pt-6">
        <div className="col-span-2">
          <div className=" origin-top-right overflow-hidden rounded-xl border shadow-xl transition-all hover:rotate-0 hover:shadow-sm lg:-rotate-6">
            <AspectRatio ratio={3 / 2}>
              <Image
                alt="screenshot of form editor"
                src="/screenshots/autogenerate_form.png"
                fill
              />
            </AspectRatio>
          </div>
        </div>
        <div className="col-span-1">
          <h4 className=" mb-1   gap-2 text-2xl font-normal lg:mb-5 lg:text-3xl">
            AI-Powered Form Generation
          </h4>
          <p className="text-md">
            {`Simply explain the purpose and requirements of your form, and let our advanced AI technology take over the task. It'll proficiently generate a comprehensive form, including all necessary fields, further simplifying your workflow.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

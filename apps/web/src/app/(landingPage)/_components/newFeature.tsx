"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AspectRatio } from "@convoform/ui/components/ui/aspect-ratio";
import { motion, useAnimate, useInView } from "framer-motion";

import { useMediaQuery } from "@/hooks/use-media-query";

export function NewFeature() {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const initializeAnimation = async () => {
    if (isInView) {
      await animate(
        scope.current,
        { scale: 1 },
        { duration: 0.8, type: "spring", bounce: 0.5, delay: 0.2 },
      );
      if (isDesktop) {
        await animate(
          "#feature-image",
          { rotate: -6 },
          { duration: 0.5, ease: "easeInOut" },
        );
      } else {
        await animate("#feature-image", { rotate: 0 });
      }
    }
  };

  useEffect(() => {
    initializeAnimation();
  }, [isInView, isDesktop]);

  return (
    <motion.div ref={scope} initial={{ scale: 0 }}>
      <div className="grid gap-5 lg:grid-cols-3 lg:pt-6">
        <div className="col-span-2">
          <motion.div
            id="feature-image"
            whileHover={{ rotate: 0 }}
            onHoverEnd={() => animate("#feature-image", { rotate: -6 })}
            className=" origin-top-right overflow-hidden rounded-xl border transition-all hover:shadow-sm lg:shadow-xl"
          >
            <AspectRatio ratio={3 / 2}>
              <Image
                alt="screenshot of form editor"
                src="/screenshots/autogenerate_form.png"
                fill
              />
            </AspectRatio>
          </motion.div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col justify-center">
            <h4 className=" mb-1   gap-2 text-2xl font-normal lg:mb-5 lg:text-3xl">
              AI-Powered Form Generation
            </h4>
            <p className="text-md">
              {`Simply explain the purpose and requirements of your form, and let our advanced AI technology take over the task. It'll proficiently generate a comprehensive form, including all necessary fields, further simplifying your workflow.`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

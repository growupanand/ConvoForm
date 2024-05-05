"use client";

import { useEffect } from "react";
import Image from "next/image";
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
          { rotateZ: -5 },
          { duration: 1, ease: "easeIn" },
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
            whileHover={{ rotateZ: 0 }}
            onHoverEnd={() => animate("#feature-image", { rotateZ: -5 })}
            className=" origin-top-right overflow-hidden rounded-xl border transition-all hover:shadow-sm lg:shadow-xl"
          >
            <Image
              alt="screenshot of new feature in ConvoForm"
              src="/screenshots/newFeature.png"
              width={550}
              height={400}
            />
          </motion.div>
        </div>
        <div className="col-span-1">
          <div className="flex h-full flex-col justify-center">
            <h4 className=" mb-1   gap-2 text-2xl font-normal lg:mb-5 lg:text-3xl">
              Live Progress Conversations
            </h4>
            <p className="text-md">
              {`Get a real-time view of users filling out your forms! Track progress, see exactly where they are in the form, and gain valuable insights with the new live conversation feature on the responses page.`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

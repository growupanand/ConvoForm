"use client";

import { Button } from "@convoform/ui/components/ui/button";
import { motion, stagger, useAnimate } from "framer-motion";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Spinner from "../common/spinner";

type Props = {
  onCTAClick: () => Promise<void>;
  postCTAClick: () => void;
  title: string;
  message: string;
  CTALabel: string;
  fontColor?: string;
};

export const WelcomeScreen = ({
  onCTAClick,
  postCTAClick,
  title,
  message,
  CTALabel,
  fontColor,
}: Props) => {
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [scope, animate] = useAnimate();

  const handleCTAClick = async () => {
    setIsStartingConversation(true);
    await onCTAClick();
    await animate(scope.current, { opacity: 0 }, { duration: 1 });
    postCTAClick();
    setIsStartingConversation(false);
  };

  useEffect(() => {
    animate(
      ".welcome-screen-text",
      { opacity: 1, y: 0 },
      { delay: stagger(0.2) },
    );
  }, []);

  return (
    <div ref={scope} id="welcome-screen">
      <div
        className={cn(
          "flex flex-col gap-4 items-center justify-center text-center",
          "max-lg:py-20",
        )}
      >
        <motion.span
          className="welcome-screen-text"
          initial={{ opacity: 0, y: 10 }}
        >
          <h2
            style={{ color: fontColor }}
            className=" whitespace-break-spaces break-words  font-extrabold text-4xl lg:text-5xl transition-colors duration-500 mb-6"
          >
            {title}
          </h2>
        </motion.span>
        <motion.span
          className="welcome-screen-text"
          initial={{ opacity: 0, y: 10 }}
        >
          <p
            style={{ color: fontColor }}
            className="welcome-screen-text mb-20 whitespace-break-spaces break-words tracking-tight font-medium text-xl lg:text-2xl transition-colors duration-500"
          >
            {message}
          </p>
        </motion.span>
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              delay: 0.4,
              bounce: 0.5,
            }}
          >
            <Button
              disabled={isStartingConversation}
              size="lg"
              className="font-montserrat whitespace-break-spaces rounded-full  font-medium transition-all hover:scale-110 active:scale-100 text-2xl h-auto py-4 gap-2"
              onClick={handleCTAClick}
            >
              {isStartingConversation && <Spinner />} {CTALabel}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

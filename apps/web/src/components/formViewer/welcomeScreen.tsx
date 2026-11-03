"use client";

import { Button } from "@convoform/ui";
import { motion, stagger, useAnimate } from "motion/react";

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
  backgroundColor?: string;
};

const parseHexColor = (value?: string) => {
  if (!value) return null;
  const hex = value.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) return null;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const parsed = Number.parseInt(full, 16);
  if (Number.isNaN(parsed)) return null;
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const relativeLuminance = ({
  r,
  g,
  b,
}: { r: number; g: number; b: number }) => {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrastRatio = (
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

// A form creator can pick any font/background pair. Keep their choice when it
// already meets WCAG AA, and fall back to the form's readable ink (or white)
// when it does not, so the welcome screen never ships 2:1 text.
const readableFontColor = (fontColor?: string, backgroundColor?: string) => {
  if (!fontColor || !backgroundColor) return fontColor;
  const foreground = parseHexColor(fontColor);
  const background = parseHexColor(backgroundColor);
  if (!foreground || !background) return fontColor;
  if (contrastRatio(foreground, background) >= 4.5) return fontColor;

  const darkInk = parseHexColor("#0f172a");
  const lightInk = parseHexColor("#f8fafc");
  if (!darkInk || !lightInk) return fontColor;
  return contrastRatio(darkInk, background) >=
    contrastRatio(lightInk, background)
    ? "#0f172a"
    : "#f8fafc";
};

export const WelcomeScreen = ({
  onCTAClick,
  postCTAClick,
  title,
  message,
  CTALabel,
  fontColor,
  backgroundColor,
}: Props) => {
  const resolvedFontColor = readableFontColor(fontColor, backgroundColor);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [scope, animate] = useAnimate();

  const handleCTAClick = async () => {
    setIsStartingConversation(true);
    await onCTAClick();
    await animate(scope.current, { opacity: 0 }, { duration: 0.5 });
    postCTAClick();
    setIsStartingConversation(false);
  };

  useEffect(() => {
    const animationControls = animate(
      ".welcome-screen-text",
      { opacity: 1, y: 0 },
      { delay: stagger(0.2) },
    );

    // Cleanup function to handle unmounting
    return () => {
      if (animationControls && typeof animationControls.stop === "function") {
        animationControls.stop();
      }
    };
  }, []);

  return (
    <div ref={scope} id="welcome-screen" className="absolute inset-0">
      <div
        className={cn(
          "h-full flex flex-col gap-4 items-center justify-center text-center",
          "max-lg:py-20",
        )}
      >
        <motion.span
          className="welcome-screen-text"
          initial={{ opacity: 0, y: 10 }}
        >
          <h2
            style={{ color: resolvedFontColor }}
            className=" whitespace-break-spaces break-words  font-extrabold text-4xl lg:text-5xl transition-colors duration-500"
          >
            {title}
          </h2>
        </motion.span>
        <motion.span
          className="welcome-screen-text"
          initial={{ opacity: 0, y: 10 }}
        >
          <p
            style={{ color: resolvedFontColor }}
            className="welcome-screen-text mb-20 whitespace-break-spaces break-words tracking-tight font-medium text-xl lg:text-2xl transition-colors duration-500"
          >
            {message}
          </p>
        </motion.span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            delay: 0.4,
            bounce: 0.5,
          }}
          layoutId="start-conversation"
        >
          <motion.span>
            <Button
              disabled={isStartingConversation}
              size="lg"
              className="whitespace-break-spaces rounded-full  font-medium transition-all hover:scale-110 active:scale-100 text-2xl h-auto py-4 gap-2"
              onClick={handleCTAClick}
            >
              {isStartingConversation && (
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ duration: 0.25 }}
                >
                  <Spinner />
                </motion.span>
              )}{" "}
              {CTALabel}
            </Button>
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

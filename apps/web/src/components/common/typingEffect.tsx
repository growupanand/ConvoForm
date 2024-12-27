"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
interface TypingEffectProps {
  text: string;
  typingSpeed?: number;
}

export function TypingEffect({ text, typingSpeed = 15 }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTyping = displayedText !== text || currentIndex === 0;

  // To track the previous text
  const previousTextRef = useRef<string>("");

  const startTyping = () => {
    // Determine if this is a new text response by comparing the new text with the previous one
    if (
      (displayedText !== "" && !text.startsWith(displayedText)) ||
      text === ""
    ) {
      // New text response detected, reset typing effect
      setDisplayedText("");
      setCurrentIndex(0);
    }
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, typingSpeed);
      // Update the previousTextRef after handling the new text
      previousTextRef.current = text;

      return () => {
        clearTimeout(timer);
      };
    }
  };

  useEffect(startTyping, [currentIndex, text, typingSpeed]);

  return (
    <span className="inline">
      {displayedText}
      {isTyping && <TypingCursor />}
    </span>
  );
}

export function TypingCursor() {
  return (
    <motion.span
      layoutId="typing-cursor"
      className="inline text-muted-foreground font-extrabold animate-ping"
    >
      {" |"}
    </motion.span>
  );
}

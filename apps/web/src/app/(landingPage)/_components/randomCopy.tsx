"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const funnyMessages = [
  "Where boring forms go to get a personality transplant. Free forever, no strings attached!",
  "Forms that chat better than your coworker on Monday morning coffee.",
  "Break up with boring forms. We promise this relationship will last.",
  "All of the conversation, none of the awkward small talk. And it's free!",
  "It's like teaching your forms improve comedy, minus the awkward audience participation.",
  "The form that won't ghost you after collecting your data. We're committed!",
  "Form meets AI, falls in love, open sources the wedding photos.",
  "Your data, your code, your rules. It's like democracy, but for forms!",
  "We made forms so conversational, they've started asking about YOUR weekend.",
  "The only form that doesn't make you feel like you're being interrogated by a robot.",
  "Half form, half chatbot, 100% open source magic.",
  "Forms that listen better than your therapist (and cost significantly less).",
  "We're what happens when forms stop being polite and start getting conversational.",
] as const;

export function RandomCopy({ className }: { className?: string }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Pick a random message when the component mounts
    const randomIndex = Math.floor(Math.random() * funnyMessages.length);
    setMessage(funnyMessages[randomIndex] as string);
  }, []);

  // Return empty during SSR to avoid hydration mismatch
  if (!message) return null;

  return (
    <p
      className={cn(
        "text-base lg:text-lg text-gray-600 max-w-2xl mx-auto",
        className,
      )}
    >
      {message}
    </p>
  );
}

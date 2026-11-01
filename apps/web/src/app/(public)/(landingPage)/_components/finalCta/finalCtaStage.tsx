"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { FinalCtaStatic } from "./finalCtaStatic";

const FinalCtaAnimation = dynamic(() => import("./finalCtaAnimation"), {
  ssr: false,
});

const STAGE_LABEL =
  "Line drawing: pieces of a form drift in and become a chat bubble asking, Hi! What should I call you?";

export function FinalCtaStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      const shouldAnimate = !motionQuery.matches;
      setAnimate(shouldAnimate);
      if (!shouldAnimate) {
        setReady(false);
        setShouldLoad(false);
      }
    };

    updatePreference();
    motionQuery.addEventListener("change", updatePreference);

    return () => motionQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!animate) return;

    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label={STAGE_LABEL}
      className="relative w-full"
    >
      <div
        aria-hidden="true"
        className={cn(
          "transition-opacity duration-150 motion-reduce:transition-none motion-safe:[[data-js]_&]:opacity-0",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <FinalCtaStatic />
      </div>

      {animate && shouldLoad ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-opacity duration-150 motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <FinalCtaAnimation onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}

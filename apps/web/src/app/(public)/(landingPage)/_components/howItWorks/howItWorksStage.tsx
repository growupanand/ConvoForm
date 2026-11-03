"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { HOW_IT_WORKS_SCENARIOS } from "./scenarios";

const HowItWorksAnimation = dynamic(() => import("./howItWorksAnimation"), {
  ssr: false,
});

type HowItWorksStageProps = {
  /** Matches the first frame of the animation, shown before it loads. */
  staticStartFrame: React.ReactNode;
  /** The fully informative frame, kept for reduced motion. */
  staticFinalFrame: React.ReactNode;
};

export function HowItWorksStage({
  staticStartFrame,
  staticFinalFrame,
}: HowItWorksStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const scenario =
    HOW_IT_WORKS_SCENARIOS[scenarioIndex] ?? HOW_IT_WORKS_SCENARIOS[0];

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
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div>
      <div
        aria-hidden="true"
        className="mt-11 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-marketing-label"
      >
        <span>Example</span>
        <span className="text-marketing-ink">{scenario?.name}</span>
        <span className="flex items-center gap-1.5">
          {HOW_IT_WORKS_SCENARIOS.map((item, index) => (
            <span
              key={item.name}
              className={cn(
                "block h-0 border-t transition-[width,border-color] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none",
                index === scenarioIndex
                  ? "w-[22px] border-marketing-blue-600"
                  : "w-2.5 border-marketing-hair",
              )}
            />
          ))}
        </span>
      </div>

      <div
        ref={stageRef}
        role="img"
        aria-label="Line drawing: a static form's fields peel off into a conversation that asks a follow-up, and the answers flow into a clean data table"
        className="relative isolate mx-auto mt-2.5 aspect-[345/664] w-full max-w-[420px] overflow-hidden bg-marketing-paper min-[900px]:aspect-[1080/336] min-[900px]:max-w-[1080px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
        />

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150 motion-reduce:hidden",
            ready ? "opacity-0" : "opacity-100",
          )}
        >
          {staticStartFrame}
        </div>

        <div className="absolute inset-0 hidden motion-reduce:block">
          {staticFinalFrame}
        </div>

        {animate && shouldLoad ? (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-150",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <HowItWorksAnimation
              onReady={() => setReady(true)}
              onScenarioChange={setScenarioIndex}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

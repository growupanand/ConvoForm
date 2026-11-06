"use client";

import type { StageStatus } from "@/components/common/stageshow";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { type PlayOnceStageHandle, StageControl } from "../stageControl";
import styles from "./finalCta.module.css";
import { FinalCtaStatic } from "./finalCtaStatic";

const FinalCtaAnimation = dynamic(() => import("./finalCtaAnimation"), {
  ssr: false,
});

const STAGE_LABEL =
  "Line drawing: pieces of a form drift in and become a chat bubble asking, Hi! What should I call you?";

export function FinalCtaStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<PlayOnceStageHandle | null>(null);
  const [animate, setAnimate] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<StageStatus>("paused");

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      const isStatic =
        new URLSearchParams(window.location.search).get("static") === "1";
      const shouldAnimate = !motionQuery.matches && !isStatic;
      setAnimate(shouldAnimate);
      if (!shouldAnimate) {
        setReady(false);
        setShouldLoad(false);
        setStatus("paused");
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
    <div>
      <div
        ref={stageRef}
        role="img"
        aria-label={STAGE_LABEL}
        className="relative w-full"
      >
        <div aria-hidden="true" className={styles.poster}>
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
            <FinalCtaAnimation
              onReady={() => setReady(true)}
              onStatusChange={setStatus}
              handleRef={handleRef}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
        <p className="font-mono text-[11px] leading-[1.4] tracking-[0.04em] text-marketing-label min-[900px]:text-xs">
          Illustrative example
        </p>
        <div className="flex size-8 items-center justify-center">
          {animate && ready ? (
            <StageControl
              status={status}
              onPause={() => handleRef.current?.pause()}
              onPlay={() => handleRef.current?.play()}
              onReplay={() => handleRef.current?.replay()}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

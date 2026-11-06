"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { StageHandle, StageStatus } from "@/components/common/stageshow";

import { HeroFinalFrame, HeroStartFrame } from "./heroFrames";
import { StageControl } from "./stageControl";
import "./stageLayers.css";

const HeroScene = dynamic(
  () => import("./heroScene").then((module) => module.HeroScene),
  { ssr: false },
);

const STAGE_LABEL =
  "Illustrative example: a study-abroad enquiry form is submitted with the budget empty, breaks apart, and becomes a conversation that asks which country and what budget. A vague budget gets one clarifying follow-up, and the answers fill the clean record your counsellor sees.";

export function HeroStage() {
  // The head script sets `data-js` before paint, so the start frame is already
  // showing. This only decides whether to load the live Stage: never for
  // reduced motion or `?static=1`, which keep the CSS final frame.
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<StageStatus>("paused");
  const handleRef = useRef<StageHandle | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const isStatic =
        new URLSearchParams(window.location.search).get("static") === "1";
      const shouldAnimate = !motionQuery.matches && !isStatic;
      setAnimate(shouldAnimate);
      if (!shouldAnimate) setReady(false);
    };

    update();
    motionQuery.addEventListener("change", update);
    return () => motionQuery.removeEventListener("change", update);
  }, []);

  return (
    <div className="stage-container">
      <div className="-mx-4 mt-6 min-[900px]:mx-0">
        <div
          role="img"
          aria-label={STAGE_LABEL}
          data-ready={ready || undefined}
          className="stage-shell stage-shell--hero mx-auto bg-marketing-paper"
        >
          <div aria-hidden="true" className="stage-layer stage-layer--final">
            <HeroFinalFrame />
          </div>
          <div aria-hidden="true" className="stage-layer stage-layer--start">
            <HeroStartFrame />
          </div>
          {animate ? (
            <div aria-hidden="true" className="stage-layer stage-layer--live">
              <HeroScene
                onReady={() => setReady(true)}
                onStatusChange={setStatus}
                handleRef={handleRef}
              />
            </div>
          ) : null}
        </div>
        {/* The control's slot is reserved even before it mounts, so the
            caption never shifts and the stage keeps CLS at 0. */}
        <div className="mx-auto mt-3 grid min-h-11 max-w-[358px] grid-cols-[2rem_auto_2rem] items-center justify-center gap-2">
          <span aria-hidden="true" />
          <p className="font-mono text-xs leading-[1.4] tracking-[0.04em] text-marketing-label">
            Illustrative example
          </p>
          <div className="flex justify-end">
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
    </div>
  );
}

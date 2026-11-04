"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { HowItWorksFinalFrame, HowItWorksStartFrame } from "./howItWorksFrames";
import "../stageLayers.css";

const HowItWorksScene = dynamic(
  () => import("./howItWorksScene").then((module) => module.HowItWorksScene),
  { ssr: false },
);

const STAGE_LABEL =
  "Illustrative example: a form is described and drafted, its link is shared into a phone message, the student answers the chat including one follow-up, and the answers fill a clean 4/4 response with transcript, CSV and Google Sheets actions.";

export function HowItWorksStage() {
  // The head script sets `data-js` before paint, so the start frame is already
  // showing. This only decides whether to load the live Stage: never for
  // reduced motion or `?static=1`, which keep the CSS final frame.
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);

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
      <div className="-mx-4 mt-10 min-[900px]:mx-0">
        <div
          role="img"
          aria-label={STAGE_LABEL}
          data-ready={ready || undefined}
          className="stage-shell stage-shell--how mx-auto bg-marketing-paper"
        >
          <div aria-hidden="true" className="stage-layer stage-layer--final">
            <HowItWorksFinalFrame />
          </div>
          <div aria-hidden="true" className="stage-layer stage-layer--start">
            <HowItWorksStartFrame />
          </div>
          {animate ? (
            <div aria-hidden="true" className="stage-layer stage-layer--live">
              <HowItWorksScene onReady={() => setReady(true)} />
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-xs leading-[1.4] tracking-[0.04em] text-marketing-label">
        Illustrative example
      </p>
    </div>
  );
}

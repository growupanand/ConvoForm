"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { HeroFinalFrame, HeroStartFrame } from "./heroFrames";
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
              <HeroScene onReady={() => setReady(true)} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

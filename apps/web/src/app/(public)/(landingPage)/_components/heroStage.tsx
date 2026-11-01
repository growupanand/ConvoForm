"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { HeroStatic } from "./heroStatic";

const HeroAnimation = dynamic(() => import("./heroAnimation"), {
  ssr: false,
  loading: () => <HeroStatic />,
});

const STAGE_LABEL =
  "Illustrative example: a static enquiry form breaks apart and becomes a conversation that asks a follow-up about a student's budget before saving the answer.";

export function HeroStage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="img"
      aria-label={STAGE_LABEL}
      className="relative mx-auto mt-6 h-[420px] w-full max-w-[1040px] overflow-hidden rounded-[22px] min-[900px]:h-[400px] min-[900px]:rounded-[28px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marketing-blue-300/55 blur-[60px] min-[900px]:size-[420px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[12%] size-[220px] rounded-full bg-blue-200/55 blur-[60px] min-[900px]:size-[260px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] right-[12%] size-[200px] rounded-full bg-marketing-blue-200/55 blur-[60px] min-[900px]:size-[240px]"
      />

      {animate ? <HeroAnimation /> : <HeroStatic />}
    </div>
  );
}

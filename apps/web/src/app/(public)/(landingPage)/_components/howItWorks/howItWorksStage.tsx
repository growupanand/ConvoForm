"use client";

import { StageGate } from "@/components/common/stageshow/stageGate";
import dynamic from "next/dynamic";

const HowItWorksAnimation = dynamic(() => import("./howItWorksAnimation"), {
  ssr: false,
});

/** The "How it works" stage: server-drawn static frames, with the live loop loaded in view. */
export function HowItWorksStage({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-11 w-full max-w-[1040px]">
      <p
        aria-hidden="true"
        className="mb-3 flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-marketing-label"
      >
        <span>Example</span>
        <span className="text-marketing-ink">Study abroad enquiry</span>
      </p>
      <StageGate label={label} live={<HowItWorksAnimation />}>
        {children}
      </StageGate>
    </div>
  );
}

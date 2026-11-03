"use client";

import { StageGate } from "@/components/common/stageshow/stageGate";
import dynamic from "next/dynamic";

const HeroAnimation = dynamic(() => import("./heroAnimation"), { ssr: false });

/** The hero stage: server-drawn static frames, with the live loop loaded in view. */
export function HeroStage({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-[1040px]">
      <StageGate label={label} live={<HeroAnimation />}>
        {children}
      </StageGate>
    </div>
  );
}

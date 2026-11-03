"use client";

import { Stage } from "@/components/common/stageshow/stage";
import { liveThreadParts } from "@/components/common/stageshow/thread";

import {
  HOW_INITIAL,
  HOW_REST,
  HOW_SIZES,
  HowItWorksScene,
  type HowState,
} from "./howItWorksScene";
import { howItWorksScript } from "./howItWorksScript";

export default function HowItWorksAnimation() {
  return (
    <Stage<HowState>
      sizes={HOW_SIZES}
      initial={HOW_INITIAL}
      script={howItWorksScript}
      rest={HOW_REST}
    >
      {(state, layout) => (
        <HowItWorksScene
          state={state}
          layout={layout}
          parts={liveThreadParts}
        />
      )}
    </Stage>
  );
}

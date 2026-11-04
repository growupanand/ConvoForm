import type { Layout } from "@/components/common/stageshow";

import {
  HOW_INITIAL,
  HOW_POSTER,
  HowItWorksSceneBody,
  type HowItWorksState,
} from "./howItWorksSceneBody";
import "./howItWorksFrames.css";

// The How it works still frames. They render the same scene body as the live
// Stage, from a fixed state, and scale it with a container-relative design
// pixel. The first paint, the reduced-motion poster and the loop line up.

function Frame({
  state,
  layout,
}: {
  state: HowItWorksState;
  layout: Layout;
}) {
  return (
    <div className={`hw-variant hw-variant--${layout}`}>
      <HowItWorksSceneBody state={state} layout={layout} />
    </div>
  );
}

/** The first frame: an empty builder, before the prompt is typed. */
export function HowItWorksStartFrame() {
  return (
    <div className="hw-frame hw">
      <Frame state={HOW_INITIAL} layout="compact" />
      <Frame state={HOW_INITIAL} layout="wide" />
    </div>
  );
}

/** The final frame: the 4/4 response and the chat that produced it. */
export function HowItWorksFinalFrame() {
  return (
    <div className="hw-frame hw">
      <Frame state={HOW_POSTER} layout="compact" />
      <Frame state={HOW_POSTER} layout="wide" />
    </div>
  );
}

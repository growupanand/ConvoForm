import type { Layout } from "@/components/common/stageshow";

import {
  HERO_INITIAL,
  HERO_POSTER,
  HeroSceneBody,
  type HeroSceneState,
} from "./heroSceneBody";
import "./heroFrames.css";

// The hero's two still frames. They render the same scene body as the live
// Stage, from a fixed state, and scale it with a container-relative design
// pixel. The first paint, the reduced-motion poster and the loop line up.

function Frame({
  state,
  layout,
}: {
  state: HeroSceneState;
  layout: Layout;
}) {
  return (
    <div className={`hero-variant hero-variant--${layout}`}>
      <HeroSceneBody state={state} layout={layout} />
    </div>
  );
}

/** The first frame: a study-abroad form with two answers already in it. */
export function HeroStartFrame() {
  return (
    <div className="hero-frame cf">
      <Frame state={HERO_INITIAL} layout="compact" />
      <Frame state={HERO_INITIAL} layout="wide" />
    </div>
  );
}

/** The final frame: the conversation and the clean record it produced. */
export function HeroFinalFrame() {
  return (
    <div className="hero-frame cf">
      <Frame state={HERO_POSTER} layout="compact" />
      <Frame state={HERO_POSTER} layout="wide" />
    </div>
  );
}

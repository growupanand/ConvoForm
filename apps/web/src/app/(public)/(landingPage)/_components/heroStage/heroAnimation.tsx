"use client";

import { Stage } from "@/components/common/stageshow/stage";
import { liveThreadParts } from "@/components/common/stageshow/thread";

import {
  HERO_INITIAL,
  HERO_REST,
  HERO_SIZES,
  HeroScene,
  type HeroState,
} from "./heroScene";
import { heroScript } from "./heroScript";

export default function HeroAnimation() {
  return (
    <Stage<HeroState>
      sizes={HERO_SIZES}
      initial={HERO_INITIAL}
      script={heroScript}
      rest={HERO_REST}
    >
      {(state, layout) => (
        <HeroScene state={state} layout={layout} parts={liveThreadParts} />
      )}
    </Stage>
  );
}

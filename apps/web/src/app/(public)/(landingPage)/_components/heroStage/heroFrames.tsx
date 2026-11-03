import type { Layout } from "@/components/common/stageshow/act";
import { stillThreadParts } from "@/components/common/stageshow/parts";
import {
  StageBox,
  StageCanvas,
  StagePoster,
  StageStart,
} from "@/components/common/stageshow/stageFrame";

import { HERO_INITIAL, HERO_POSTER, HERO_SIZES, HeroScene } from "./heroScene";

const LAYOUTS: Layout[] = ["wide", "compact"];

/** The hero's static frames for both layouts, drawn on the server. */
export function HeroFrames() {
  return LAYOUTS.map((layout) => (
    <StageBox key={layout} layout={layout} size={HERO_SIZES[layout]}>
      <StageCanvas size={HERO_SIZES[layout]}>
        <StagePoster>
          <HeroScene
            state={HERO_POSTER}
            layout={layout}
            parts={stillThreadParts}
          />
        </StagePoster>
        <StageStart>
          <HeroScene
            state={HERO_INITIAL}
            layout={layout}
            parts={stillThreadParts}
          />
        </StageStart>
      </StageCanvas>
    </StageBox>
  ));
}

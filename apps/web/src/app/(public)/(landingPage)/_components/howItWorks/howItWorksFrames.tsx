import type { Layout } from "@/components/common/stageshow/act";
import { stillThreadParts } from "@/components/common/stageshow/parts";
import {
  StageBox,
  StageCanvas,
  StagePoster,
  StageStart,
} from "@/components/common/stageshow/stageFrame";

import {
  HOW_INITIAL,
  HOW_POSTER,
  HOW_SIZES,
  HowItWorksScene,
} from "./howItWorksScene";

const LAYOUTS: Layout[] = ["wide", "compact"];

/** The "How it works" static frames for both layouts, drawn on the server. */
export function HowItWorksFrames() {
  return LAYOUTS.map((layout) => (
    <StageBox key={layout} layout={layout} size={HOW_SIZES[layout]}>
      <StageCanvas size={HOW_SIZES[layout]}>
        <StagePoster>
          <HowItWorksScene
            state={HOW_POSTER}
            layout={layout}
            parts={stillThreadParts}
          />
        </StagePoster>
        <StageStart>
          <HowItWorksScene
            state={HOW_INITIAL}
            layout={layout}
            parts={stillThreadParts}
          />
        </StageStart>
      </StageCanvas>
    </StageBox>
  ));
}

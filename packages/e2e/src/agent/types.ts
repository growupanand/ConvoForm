import type { Page } from "@playwright/test";

export const MARKETING_SCREENSHOT_FRAME = {
  width: 1280,
  height: 800,
} as const;

export type ShotOptions = {
  name: string;
  out: string;
  selector?: string;
  /**
   * - viewport: full 1280×800 viewport.
   * - tight: shrink-wrap direct children of `selector`, clipped to marketing frame.
   * - element: screenshot the node matched by `selector` (default).
   */
  mode?: "viewport" | "tight" | "element";
};

export type AgentScenarioContext = {
  page: Page;
  baseURL: string;
  repoRoot: string;
  shot: (options: ShotOptions) => Promise<void>;
};

export type AgentScenario = (context: AgentScenarioContext) => Promise<void>;

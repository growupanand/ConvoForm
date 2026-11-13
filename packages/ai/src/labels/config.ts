import {
  DEFAULT_CLOUDFLARE_CLEF_MODEL,
  firstNonEmpty,
} from "../decision/config";

export const DEFAULT_LABEL_MODEL = DEFAULT_CLOUDFLARE_CLEF_MODEL;
export const DEFAULT_LABEL_TIMEOUT_MS = 1500;

export type LabelConfig = {
  model: string;
  timeoutMs: number;
};

export function parseLabelTimeoutMs(raw: string | undefined): number {
  if (!raw?.trim()) {
    return DEFAULT_LABEL_TIMEOUT_MS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10_000) {
    return DEFAULT_LABEL_TIMEOUT_MS;
  }

  return Math.floor(parsed);
}

export function getLabelConfig(): LabelConfig {
  return {
    model:
      firstNonEmpty(process.env.LABEL_MODEL, process.env.DECISION_MODEL) ??
      DEFAULT_LABEL_MODEL,
    // Labels use their own budget because a completion waits for them before
    // webhooks are queued.
    timeoutMs: parseLabelTimeoutMs(process.env.LABEL_TIMEOUT_MS),
  };
}

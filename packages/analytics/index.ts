import { PosthogAnalyticsProvider } from "./src/providers/posthogAnalyticsProvider";

export const analytics = new PosthogAnalyticsProvider();

// Export types for external usage
export type { LanguageModel } from "ai";
export type {
  LLMAnalyticsMetadata,
  LLMActionType,
} from "./src/schema";
export {
  llmActionType,
  llmAnalyticsMetadata,
} from "./src/schema";

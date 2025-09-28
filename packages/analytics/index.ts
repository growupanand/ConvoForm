import { PosthogAnalyticsProvider } from "./src/providers/posthogAnalyticsProvider";

export const analytics = new PosthogAnalyticsProvider();

// Export types for external usage
export type { LanguageModel } from "ai";
export type LLMAnalyticsMetadata = {
  userId?: string;
  traceId?: string;
  formId?: string;
  conversationId?: string;
  organizationId?: string;
  actionType?: string;
  fieldType?: string;
  isAnonymous?: boolean;
  [key: string]: unknown;
};

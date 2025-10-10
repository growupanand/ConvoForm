import type { LLMAnalyticsMetadata } from "@convoform/analytics";

/**
 * Base metadata for conversation-related AI actions
 */
export interface ConversationAIMetadata extends LLMAnalyticsMetadata {
  formId: string;
  conversationId: string;
  organizationId: string;
  userId?: string;
  fieldType?: string;
}

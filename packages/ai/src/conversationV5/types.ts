import type {
  Conversation as DBConversation,
  Form,
} from "@convoform/db/src/schema";

// Streaming types for edge compatibility
export interface StreamableValue<T> {
  value: T;
  done: boolean;
}

// Event types for orchestrator
export interface ConversationEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// AI model configuration
export interface ModelConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Edge-compatible error type
export interface AIError {
  message: string;
  code: string;
  statusCode?: number;
}

export type Conversation = DBConversation & {
  form: Form;
  currentFieldId?: string;
};

/**
 * Core types for ConversationServiceV5
 * Edge runtime compatible with no Node.js dependencies
 */

import type { CollectedData, Transcript } from "@convoform/db/src/schema";

// Core domain types
export interface FieldAnswer {
  value: string | null;
  confidence: number;
  reasoning?: string;
  skipValidation?: boolean;
  isValid?: boolean;
}

export interface ExtractAnswerParams {
  transcript: Transcript[];
  currentField: CollectedData;
  formOverview: string;
  fieldSchema?: Record<string, unknown>;
}

export interface GenerateQuestionParams {
  formOverview: string;
  currentField: CollectedData;
  collectedData: CollectedData[];
  transcript: Transcript[];
  isFirstQuestion?: boolean;
}

export interface GenerateEndMessageParams {
  formOverview: string;
  collectedData: CollectedData[];
  transcript: Transcript[];
  formTitle?: string;
  customMessage?: string;
}

export interface GenerateNameParams {
  formOverview: string;
  collectedData: CollectedData[];
  transcript: Transcript[];
}

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

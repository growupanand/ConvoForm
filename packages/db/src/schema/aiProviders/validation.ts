import { z } from "zod/v4";

/**
 * Providers that an organization can connect with its own credentials.
 * Ollama is intentionally absent: it is only available as a ConvoForm
 * environment default for local development.
 */
export const AI_PROVIDER_IDS = [
  "openai",
  "anthropic",
  "google",
  "groq",
  "openrouter",
  "cloudflare",
  "custom",
] as const;

export const aiProviderIdSchema = z.enum(AI_PROVIDER_IDS);
export type AiProviderId = z.infer<typeof aiProviderIdSchema>;

export const AI_CREDENTIAL_STATUSES = [
  "untested",
  "active",
  "failing",
  "disabled",
] as const;

export const aiCredentialStatusSchema = z.enum(AI_CREDENTIAL_STATUSES);
export type AiCredentialStatus = z.infer<typeof aiCredentialStatusSchema>;

export const AI_USE_CASES = ["chat", "decisions", "background"] as const;

export const aiUseCaseSchema = z.enum(AI_USE_CASES);
export type AiUseCase = z.infer<typeof aiUseCaseSchema>;

export const AI_PROVIDER_AUDIT_ACTIONS = [
  "create",
  "replace",
  "delete",
  "test",
  "activate",
  "deactivate",
  "set_use_case_model",
] as const;

export const aiProviderAuditActionSchema = z.enum(AI_PROVIDER_AUDIT_ACTIONS);
export type AiProviderAuditAction = z.infer<typeof aiProviderAuditActionSchema>;

export const AI_PROVIDER_AUDIT_RESULTS = ["success", "failure"] as const;

export const aiProviderAuditResultSchema = z.enum(AI_PROVIDER_AUDIT_RESULTS);
export type AiProviderAuditResult = z.infer<typeof aiProviderAuditResultSchema>;

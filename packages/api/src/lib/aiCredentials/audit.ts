import { aiProviderAudit } from "@convoform/db/src/schema";
import type {
  AiProviderAuditAction,
  AiProviderAuditResult,
  AiProviderId,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export type AiProviderAuditContext = {
  db: ActionContext["db"];
  userId: string;
  orgId: string;
};

export type RecordAiProviderAuditInput = {
  action: AiProviderAuditAction;
  result: AiProviderAuditResult;
  provider?: AiProviderId | null;
  credentialId?: string | null;
  /** Safe machine-readable code, never a provider message. */
  errorCode?: string | null;
};

/**
 * Appends one audit row. Secrets and ciphertext must never be passed here.
 */
export async function recordAiProviderAudit(
  ctx: AiProviderAuditContext,
  input: RecordAiProviderAuditInput,
) {
  await ctx.db.insert(aiProviderAudit).values({
    organizationId: ctx.orgId,
    userId: ctx.userId,
    credentialId: input.credentialId ?? null,
    provider: input.provider ?? null,
    action: input.action,
    result: input.result,
    errorCode: input.errorCode ?? null,
  });
}

import {
  decryptAiCredentialSecret,
  encryptAiCredentialSecret,
  getAiCredentialLast4,
} from "@convoform/common";
import { and, eq } from "@convoform/db";
import {
  type AiProviderCredential,
  type OrganizationAiSettings,
  aiProviderCredential,
  aiProviderIdSchema,
  aiUseCaseSchema,
  organizationAiSettings,
} from "@convoform/db/src/schema";
import {
  forgetSensitiveValue,
  registerSensitiveValue,
} from "@convoform/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { recordAiProviderAudit } from "../lib/aiCredentials/audit";
import {
  getAiCredentialMasterKey,
  getCurrentAiCredentialKeyVersion,
  getCurrentAiCredentialMasterKey,
} from "../lib/aiCredentials/masterKeys";
import { assertSafeAiBaseUrl } from "../lib/aiCredentials/ssrf";
import {
  type AiProviderConnectionTestResult,
  testAiProviderConnection,
} from "../lib/aiCredentials/testProviderConnection";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";
import type { ActionContext } from "../types/actionContextType";

const ACCOUNT_ID_PATTERN = /^[a-f0-9]{32}$/i;
const MIN_SECRET_LENGTH = 8;
const MAX_SECRET_LENGTH = 4_096;

const credentialIdInput = z.object({ id: z.string().min(1) });

const providerConnectionInput = {
  accountId: z.string().trim().min(1).max(128).optional(),
  baseUrl: z.string().trim().min(1).max(2_048).optional(),
  secret: z.string().trim().min(MIN_SECRET_LENGTH).max(MAX_SECRET_LENGTH),
};

const createInputSchema = z.object({
  provider: aiProviderIdSchema,
  label: z.string().trim().min(1).max(80),
  ...providerConnectionInput,
});

const replaceInputSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80).optional(),
  ...providerConnectionInput,
});

const setUseCaseModelInputSchema = z.object({
  useCase: aiUseCaseSchema,
  credentialId: z.string().min(1).nullable(),
  model: z.string().trim().min(1).max(200).nullable(),
});

const setEnabledInputSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

const testInputSchema = z
  .object({
    id: z.string().min(1).optional(),
    provider: aiProviderIdSchema.optional(),
    secret: z
      .string()
      .trim()
      .min(MIN_SECRET_LENGTH)
      .max(MAX_SECRET_LENGTH)
      .optional(),
    accountId: providerConnectionInput.accountId,
    baseUrl: providerConnectionInput.baseUrl,
    model: z.string().trim().min(1).max(200).optional(),
  })
  .refine(
    (value) =>
      value.id
        ? !value.provider && !value.secret && !value.accountId && !value.baseUrl
        : Boolean(value.provider && value.secret),
    {
      message:
        "Provide either a saved credential id (with an optional model) or a provider and secret",
    },
  );

type PublicAiProviderCredential = {
  id: string;
  provider: AiProviderCredential["provider"];
  label: string;
  baseUrl: string | null;
  last4: string;
  status: AiProviderCredential["status"];
  lastTestedAt: Date | null;
  lastTestResult: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

type PublicCredentialFields = Pick<
  AiProviderCredential,
  | "id"
  | "provider"
  | "label"
  | "baseUrl"
  | "last4"
  | "status"
  | "lastTestedAt"
  | "lastTestResult"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
>;

type AiProviderRouterContext = {
  db: ActionContext["db"];
  orgId: string;
};

type PublicAiSettings = Record<
  "chat" | "decisions" | "background",
  { credentialId: string | null; model: string | null }
>;

/**
 * Only the fields a client may see. Ciphertext, IVs, wrapped keys and the
 * secret itself are never part of this projection.
 */
function toPublicCredential(
  row: PublicCredentialFields,
): PublicAiProviderCredential {
  return {
    id: row.id,
    provider: row.provider,
    label: row.label,
    baseUrl: row.baseUrl,
    last4: row.last4,
    status: row.status,
    lastTestedAt: row.lastTestedAt,
    lastTestResult: row.lastTestResult,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPublicSettings(
  row: OrganizationAiSettings | undefined,
): PublicAiSettings {
  return {
    chat: {
      credentialId: row?.chatCredentialId ?? null,
      model: row?.chatModel ?? null,
    },
    decisions: {
      credentialId: row?.decisionsCredentialId ?? null,
      model: row?.decisionsModel ?? null,
    },
    background: {
      credentialId: row?.backgroundCredentialId ?? null,
      model: row?.backgroundModel ?? null,
    },
  };
}

function notFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "AI provider credential not found",
  });
}

function badRequestError(message: string) {
  return new TRPCError({ code: "BAD_REQUEST", message });
}

async function getCredentialForOrg(
  ctx: { db: AiProviderRouterContext["db"]; orgId: string },
  id: string,
): Promise<AiProviderCredential> {
  const row = await ctx.db.query.aiProviderCredential.findFirst({
    where: and(
      eq(aiProviderCredential.id, id),
      eq(aiProviderCredential.organizationId, ctx.orgId),
    ),
  });

  if (!row) {
    throw notFoundError();
  }

  return row;
}

async function withRedactedSecret<T>(
  secret: string,
  run: () => Promise<T>,
): Promise<T> {
  registerSensitiveValue(secret);
  try {
    return await run();
  } finally {
    forgetSensitiveValue(secret);
  }
}

type NormalizedConnectionFields = {
  accountId: string | null;
  baseUrl: string | null;
};

/**
 * Validates the provider-specific fields and normalizes the base URL.
 * Throws a BAD_REQUEST with a safe message.
 */
async function normalizeConnectionFields(params: {
  provider: AiProviderCredential["provider"];
  accountId?: string;
  baseUrl?: string;
}): Promise<NormalizedConnectionFields> {
  if (params.provider === "custom") {
    if (params.accountId) {
      throw badRequestError("The Custom provider does not take an account id");
    }

    if (!params.baseUrl) {
      throw badRequestError("A base URL is required for the Custom provider");
    }

    try {
      const safeUrl = await assertSafeAiBaseUrl(params.baseUrl);

      if (safeUrl.search || safeUrl.hash) {
        throw badRequestError(
          "The base URL must not include a query string or fragment",
        );
      }

      return {
        accountId: null,
        baseUrl: safeUrl.toString().replace(/\/+$/, ""),
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw badRequestError(
        error instanceof Error ? error.message : "The base URL is not allowed",
      );
    }
  }

  if (params.provider === "cloudflare") {
    if (params.baseUrl) {
      throw badRequestError("Cloudflare Workers AI does not take a base URL");
    }

    if (!params.accountId) {
      throw badRequestError(
        "A Cloudflare account id is required for Workers AI",
      );
    }

    if (!ACCOUNT_ID_PATTERN.test(params.accountId)) {
      throw badRequestError(
        "The Cloudflare account id must be 32 hexadecimal characters",
      );
    }

    return {
      accountId: params.accountId.toLowerCase(),
      baseUrl: null,
    };
  }

  if (params.accountId || params.baseUrl) {
    throw badRequestError(
      "This provider does not take an account id or base URL",
    );
  }

  return { accountId: null, baseUrl: null };
}

function useCasePatch(
  useCase: "chat" | "decisions" | "background",
  credentialId: string | null,
  model: string | null,
): Partial<OrganizationAiSettings> {
  const updatedAt = new Date();

  switch (useCase) {
    case "chat":
      return { chatCredentialId: credentialId, chatModel: model, updatedAt };
    case "decisions":
      return {
        decisionsCredentialId: credentialId,
        decisionsModel: model,
        updatedAt,
      };
    case "background":
      return {
        backgroundCredentialId: credentialId,
        backgroundModel: model,
        updatedAt,
      };
  }
}

async function updateCredentialTestState(
  ctx: { db: AiProviderRouterContext["db"]; orgId: string },
  id: string,
  result: AiProviderConnectionTestResult,
) {
  await ctx.db
    .update(aiProviderCredential)
    .set({
      status: result.ok ? "active" : "failing",
      lastTestedAt: new Date(),
      lastTestResult: result.ok ? "success" : result.errorCode,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(aiProviderCredential.id, id),
        eq(aiProviderCredential.organizationId, ctx.orgId),
      ),
    );
}

export const aiProviderRouter = createTRPCRouter({
  /**
   * Lists connected providers without any secret material, plus the model
   * selected for each use case.
   */
  list: orgProtectedProcedure.query(async ({ ctx }) => {
    const [credentials, settings] = await Promise.all([
      ctx.db.query.aiProviderCredential.findMany({
        where: eq(aiProviderCredential.organizationId, ctx.orgId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        columns: {
          encryptedSecret: false,
          iv: false,
          wrappedDataKey: false,
          keyVersion: false,
        },
      }),
      ctx.db.query.organizationAiSettings.findFirst({
        where: eq(organizationAiSettings.organizationId, ctx.orgId),
      }),
    ]);

    return {
      credentials: credentials.map(toPublicCredential),
      settings: toPublicSettings(settings),
    };
  }),

  /**
   * Stores a new credential. It starts as `untested` and only becomes `active`
   * after a successful `test`.
   */
  create: orgProtectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }) => {
      const connection = await normalizeConnectionFields(input);

      return withRedactedSecret(input.secret, async () => {
        const ciphertext = await encryptAiCredentialSecret({
          secret: input.secret,
          organizationId: ctx.orgId,
          provider: input.provider,
          masterKey: getCurrentAiCredentialMasterKey(),
          keyVersion: getCurrentAiCredentialKeyVersion(),
        });

        let row: AiProviderCredential | undefined;
        try {
          [row] = await ctx.db
            .insert(aiProviderCredential)
            .values({
              organizationId: ctx.orgId,
              provider: input.provider,
              label: input.label,
              baseUrl: connection.baseUrl,
              accountId: connection.accountId,
              encryptedSecret: ciphertext.encryptedSecret,
              iv: ciphertext.iv,
              wrappedDataKey: ciphertext.wrappedDataKey,
              keyVersion: ciphertext.keyVersion,
              last4: getAiCredentialLast4(input.secret),
              status: "untested",
              createdBy: ctx.userId,
            })
            .returning();
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not save the AI provider credential",
          });
        }

        if (!row) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not save the AI provider credential",
          });
        }

        await recordAiProviderAudit(ctx, {
          action: "create",
          result: "success",
          provider: row.provider,
          credentialId: row.id,
        });

        return toPublicCredential(row);
      });
    }),

  /**
   * Replaces the secret and/or label. The credential goes back to `untested`
   * because the new secret has not been verified yet.
   */
  replace: orgProtectedProcedure
    .input(replaceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await getCredentialForOrg(ctx, input.id);

      const connection = await normalizeConnectionFields({
        provider: existing.provider,
        accountId: input.accountId ?? existing.accountId ?? undefined,
        baseUrl: input.baseUrl ?? existing.baseUrl ?? undefined,
      });

      return withRedactedSecret(input.secret, async () => {
        const ciphertext = await encryptAiCredentialSecret({
          secret: input.secret,
          organizationId: ctx.orgId,
          provider: existing.provider,
          masterKey: getCurrentAiCredentialMasterKey(),
          keyVersion: getCurrentAiCredentialKeyVersion(),
        });

        let row: AiProviderCredential | undefined;
        try {
          [row] = await ctx.db
            .update(aiProviderCredential)
            .set({
              label: input.label ?? existing.label,
              baseUrl: connection.baseUrl,
              accountId: connection.accountId,
              encryptedSecret: ciphertext.encryptedSecret,
              iv: ciphertext.iv,
              wrappedDataKey: ciphertext.wrappedDataKey,
              keyVersion: ciphertext.keyVersion,
              last4: getAiCredentialLast4(input.secret),
              status: "untested",
              lastTestedAt: null,
              lastTestResult: null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(aiProviderCredential.id, existing.id),
                eq(aiProviderCredential.organizationId, ctx.orgId),
              ),
            )
            .returning();
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not replace the AI provider credential",
          });
        }

        if (!row) {
          throw notFoundError();
        }

        await recordAiProviderAudit(ctx, {
          action: "replace",
          result: "success",
          provider: row.provider,
          credentialId: row.id,
        });

        return toPublicCredential(row);
      });
    }),

  /**
   * Deletes a credential and clears every use-case selection that pointed at
   * it. The audit rows are intentionally kept.
   */
  delete: orgProtectedProcedure
    .input(credentialIdInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await getCredentialForOrg(ctx, input.id);

      const settings = await ctx.db.query.organizationAiSettings.findFirst({
        where: eq(organizationAiSettings.organizationId, ctx.orgId),
      });

      if (settings) {
        const patch: Partial<OrganizationAiSettings> = {};
        if (settings.chatCredentialId === existing.id) {
          patch.chatCredentialId = null;
          patch.chatModel = null;
        }
        if (settings.decisionsCredentialId === existing.id) {
          patch.decisionsCredentialId = null;
          patch.decisionsModel = null;
        }
        if (settings.backgroundCredentialId === existing.id) {
          patch.backgroundCredentialId = null;
          patch.backgroundModel = null;
        }

        if (Object.keys(patch).length > 0) {
          await ctx.db
            .update(organizationAiSettings)
            .set({ ...patch, updatedAt: new Date() })
            .where(eq(organizationAiSettings.organizationId, ctx.orgId));
        }
      }

      await ctx.db
        .delete(aiProviderCredential)
        .where(
          and(
            eq(aiProviderCredential.id, existing.id),
            eq(aiProviderCredential.organizationId, ctx.orgId),
          ),
        );

      await recordAiProviderAudit(ctx, {
        action: "delete",
        result: "success",
        provider: existing.provider,
        credentialId: existing.id,
      });

      return { success: true };
    }),

  /**
   * Selects a provider credential and model for one use case. `null` restores
   * the ConvoForm default for that use case.
   */
  setUseCaseModel: orgProtectedProcedure
    .input(setUseCaseModelInputSchema)
    .mutation(async ({ ctx, input }) => {
      let credential: AiProviderCredential | undefined;

      if (input.credentialId) {
        if (!input.model) {
          throw badRequestError("A model is required for this credential");
        }

        credential = await getCredentialForOrg(ctx, input.credentialId);

        if (credential.status !== "active") {
          throw badRequestError(
            "Test this credential successfully before using it",
          );
        }
      } else if (input.model) {
        throw badRequestError("Choose a credential when selecting a model");
      }

      const patch = useCasePatch(
        input.useCase,
        input.credentialId,
        input.model,
      );

      const [updated] = await ctx.db
        .insert(organizationAiSettings)
        .values({
          organizationId: ctx.orgId,
          ...patch,
        })
        .onConflictDoUpdate({
          target: organizationAiSettings.organizationId,
          set: patch,
        })
        .returning();

      await recordAiProviderAudit(ctx, {
        action: "set_use_case_model",
        result: "success",
        provider: credential?.provider ?? null,
        credentialId: credential?.id ?? null,
      });

      return toPublicSettings(updated);
    }),

  /**
   * Activates or deactivates a credential. Inactive credentials are ignored
   * by BYOK resolution and do not count towards the beta-limit exemption.
   */
  setEnabled: orgProtectedProcedure
    .input(setEnabledInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await getCredentialForOrg(ctx, input.id);

      const status = input.enabled
        ? existing.lastTestResult === "success"
          ? "active"
          : "untested"
        : "disabled";

      const [row] = await ctx.db
        .update(aiProviderCredential)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            eq(aiProviderCredential.id, existing.id),
            eq(aiProviderCredential.organizationId, ctx.orgId),
          ),
        )
        .returning();

      if (!row) {
        throw notFoundError();
      }

      await recordAiProviderAudit(ctx, {
        action: input.enabled ? "activate" : "deactivate",
        result: "success",
        provider: row.provider,
        credentialId: row.id,
      });

      return toPublicCredential(row);
    }),

  /**
   * Runs a small real call with a saved or not-yet-saved secret.
   *
   * A successful test is the only way a credential becomes `active`.
   */
  test: orgProtectedProcedure
    .input(testInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const existing = await getCredentialForOrg(ctx, input.id);

        let secret: string;
        try {
          secret = await decryptAiCredentialSecret({
            ciphertext: {
              encryptedSecret: existing.encryptedSecret,
              iv: existing.iv,
              wrappedDataKey: existing.wrappedDataKey,
              keyVersion: existing.keyVersion,
            },
            organizationId: existing.organizationId,
            provider: existing.provider,
            masterKey: getAiCredentialMasterKey(existing.keyVersion),
          });
        } catch {
          const result = {
            ok: false,
            provider: existing.provider,
            errorCode: "invalid_configuration",
            message: "The saved credential could not be read. Replace the key.",
          } as const;

          await ctx.db
            .update(aiProviderCredential)
            .set({
              status: "failing",
              lastTestedAt: new Date(),
              lastTestResult: "decryption_failed",
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(aiProviderCredential.id, existing.id),
                eq(aiProviderCredential.organizationId, ctx.orgId),
              ),
            );

          await recordAiProviderAudit(ctx, {
            action: "test",
            result: "failure",
            provider: existing.provider,
            credentialId: existing.id,
            errorCode: "decryption_failed",
          });

          return result;
        }

        const result = await withRedactedSecret(secret, () =>
          testAiProviderConnection({
            provider: existing.provider,
            secret,
            model: input.model,
            accountId: existing.accountId ?? undefined,
            baseUrl: existing.baseUrl ?? undefined,
          }),
        );

        await updateCredentialTestState(ctx, existing.id, result);

        await recordAiProviderAudit(ctx, {
          action: "test",
          result: result.ok ? "success" : "failure",
          provider: existing.provider,
          credentialId: existing.id,
          errorCode: result.ok ? null : result.errorCode,
        });

        return result;
      }

      const provider = input.provider;
      const secret = input.secret;

      if (!provider || !secret) {
        throw badRequestError(
          "Provide either a saved credential id or a provider and secret",
        );
      }

      const validation = await validateUnsavedTestInput({
        provider,
        accountId: input.accountId,
        baseUrl: input.baseUrl,
      });

      if (!validation.ok) {
        await recordAiProviderAudit(ctx, {
          action: "test",
          result: "failure",
          provider,
          credentialId: null,
          errorCode: validation.result.errorCode,
        });

        return validation.result;
      }

      const result = await withRedactedSecret(secret, () =>
        testAiProviderConnection({
          provider,
          secret,
          model: input.model,
          accountId: validation.accountId,
          baseUrl: validation.baseUrl,
        }),
      );

      await recordAiProviderAudit(ctx, {
        action: "test",
        result: result.ok ? "success" : "failure",
        provider,
        credentialId: null,
        errorCode: result.ok ? null : result.errorCode,
      });

      return result;
    }),
});

type AiProviderConnectionTestFailure = Extract<
  AiProviderConnectionTestResult,
  { ok: false }
>;

async function validateUnsavedTestInput(params: {
  provider: AiProviderCredential["provider"];
  accountId?: string;
  baseUrl?: string;
}): Promise<
  | { ok: true; accountId?: string; baseUrl?: string }
  | { ok: false; result: AiProviderConnectionTestFailure }
> {
  try {
    const normalized = await normalizeConnectionFields(params);
    return {
      ok: true,
      accountId: normalized.accountId ?? undefined,
      baseUrl: normalized.baseUrl ?? undefined,
    };
  } catch {
    return {
      ok: false,
      result: {
        ok: false,
        provider: params.provider,
        errorCode: "invalid_configuration",
        message: "This provider connection is not configured correctly.",
      },
    };
  }
}

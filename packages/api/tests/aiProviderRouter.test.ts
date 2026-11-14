import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { AiProviderConnectionTestResult } from "@convoform/ai";
import * as actualAnalytics from "@convoform/analytics";
import {
  aiProviderAudit,
  aiProviderCredential,
  organizationAiSettings,
} from "@convoform/db/src/schema";

const assertSafeAiBaseUrlMock = mock(async (url: string) => new URL(url));
const testAiProviderConnectionMock = mock(
  async (): Promise<AiProviderConnectionTestResult> => ({
    ok: true,
    provider: "openai",
    model: "gpt-4o-mini",
  }),
);
const captureExceptionMock = mock(async () => undefined);

// Only the DNS/network check is replaced so the router tests stay offline.
mock.module("../src/lib/aiCredentials/ssrf", () => ({
  assertSafeAiBaseUrl: assertSafeAiBaseUrlMock,
}));

mock.module("@convoform/analytics", () => ({
  ...actualAnalytics,
  analytics: {
    ...actualAnalytics.analytics,
    captureException: captureExceptionMock,
    track: mock(async () => undefined),
  },
}));

mock.module("../src/lib/aiCredentials/testProviderConnection", () => ({
  testAiProviderConnection: testAiProviderConnectionMock,
}));

import {
  decryptAiCredentialSecret,
  encryptAiCredentialSecret,
  getAiCredentialLast4,
} from "@convoform/common";
import { aiProviderRouter } from "../src/router/aiProvider";

const organizationId = "org_123";
const otherOrganizationId = "org_other";
const userId = "user_123";
const secret = "sk-fake-provider-key-1234567890";
const now = new Date("2026-11-14T10:00:00.000Z");

const masterKey = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));

function createCredential(overrides: Record<string, unknown> = {}) {
  return {
    id: "credential_1",
    organizationId,
    provider: "openai",
    label: "OpenAI production",
    baseUrl: null,
    accountId: null,
    encryptedSecret: "ciphertext",
    iv: "iv",
    wrappedDataKey: "1.iv.ciphertext",
    keyVersion: 1,
    last4: "7890",
    status: "active",
    lastTestedAt: now,
    lastTestResult: "success",
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function createEncryptedCredential(
  overrides: Record<string, unknown> = {},
) {
  const ciphertext = await encryptAiCredentialSecret({
    secret,
    organizationId,
    provider: "openai",
    masterKey,
    keyVersion: 1,
  });

  return createCredential({
    ...ciphertext,
    last4: getAiCredentialLast4(secret),
    ...overrides,
  });
}

function createDbMock() {
  const state = {
    credential: null as Record<string, unknown> | null,
    credentials: [] as Record<string, unknown>[],
    settings: null as Record<string, unknown> | null,
    returningRow: undefined as Record<string, unknown> | undefined,
    inserted: [] as Array<{ table: unknown; values: unknown }>,
    updated: [] as Array<{ table: unknown; values: unknown }>,
    conflicts: [] as unknown[],
    deleted: [] as unknown[],
    auditRows: [] as Record<string, unknown>[],
    lastFindManyArgs: undefined as unknown,
  };

  const credentialFindFirst = mock(async () => state.credential);
  const credentialFindMany = mock(async (args: unknown) => {
    state.lastFindManyArgs = args;
    return state.credentials;
  });
  const settingsFindFirst = mock(async () => state.settings);

  const insert = mock((table: unknown) => ({
    values: (values: unknown) => {
      state.inserted.push({ table, values });
      if (table === aiProviderAudit) {
        state.auditRows.push(values as Record<string, unknown>);
        return Promise.resolve();
      }
      return {
        returning: async () => (state.returningRow ? [state.returningRow] : []),
        onConflictDoUpdate: (args: unknown) => {
          state.conflicts.push(args);
          return {
            returning: async () =>
              state.returningRow ? [state.returningRow] : [],
          };
        },
      };
    },
  }));

  const update = mock((table: unknown) => ({
    set: (values: unknown) => {
      state.updated.push({ table, values });
      return {
        where: () => ({
          returning: async () =>
            state.returningRow ? [state.returningRow] : [],
        }),
      };
    },
  }));

  const deleteMock = mock((table: unknown) => ({
    where: async () => {
      state.deleted.push(table);
    },
  }));

  const db = {
    query: {
      aiProviderCredential: {
        findFirst: credentialFindFirst,
        findMany: credentialFindMany,
      },
      organizationAiSettings: {
        findFirst: settingsFindFirst,
      },
    },
    insert,
    update,
    delete: deleteMock,
  };

  return {
    db,
    state,
    credentialFindFirst,
    credentialFindMany,
    settingsFindFirst,
    insert,
    update,
    deleteMock,
  };
}

function createCtx(
  db: ReturnType<typeof createDbMock>["db"],
  orgId = organizationId,
) {
  return {
    db,
    auth: { userId, orgId },
    orgId,
    userId,
    user: { primaryEmailAddress: { emailAddress: "owner@example.com" } },
  } as any;
}

beforeEach(() => {
  process.env.AI_CREDENTIALS_MASTER_KEY = masterKey;
  process.env.AI_CREDENTIALS_MASTER_KEY_VERSION = "1";
  assertSafeAiBaseUrlMock.mockClear();
  testAiProviderConnectionMock.mockClear();
  captureExceptionMock.mockClear();
});

afterEach(() => {
  process.env.AI_CREDENTIALS_MASTER_KEY = undefined;
  process.env.AI_CREDENTIALS_MASTER_KEY_VERSION = undefined;
});

describe("aiProviderRouter", () => {
  describe("list", () => {
    it("returns masked credentials without ciphertext or secret fields", async () => {
      const dbMock = createDbMock();
      dbMock.state.credentials = [createCredential()];
      dbMock.state.settings = {
        id: "settings_1",
        organizationId,
        chatCredentialId: "credential_1",
        chatModel: "gpt-4o-mini",
        decisionsCredentialId: null,
        decisionsModel: null,
        backgroundCredentialId: null,
        backgroundModel: null,
        createdAt: now,
        updatedAt: now,
      };

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.list();

      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).not.toHaveProperty("encryptedSecret");
      expect(result.credentials[0]).not.toHaveProperty("wrappedDataKey");
      expect(result.credentials[0]).not.toHaveProperty("iv");
      expect(result.credentials[0]).not.toHaveProperty("keyVersion");
      expect(result.credentials[0]).not.toHaveProperty("accountId");
      expect(result.credentials[0]).not.toHaveProperty("secret");
      expect(result.credentials[0]?.last4).toBe("7890");
      expect(result.settings.chat).toEqual({
        credentialId: "credential_1",
        model: "gpt-4o-mini",
      });
      expect(dbMock.credentialFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          columns: expect.objectContaining({
            encryptedSecret: false,
            wrappedDataKey: false,
            iv: false,
            keyVersion: false,
          }),
        }),
      );
    });
  });

  describe("create", () => {
    it("encrypts the secret, stores only last4 and writes an audit row", async () => {
      const dbMock = createDbMock();
      dbMock.state.returningRow = createCredential({
        status: "untested",
        lastTestedAt: null,
        lastTestResult: null,
      });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.create({
        provider: "openai",
        label: "OpenAI production",
        secret,
      });

      expect(result).not.toHaveProperty("encryptedSecret");
      expect(result).not.toHaveProperty("secret");
      expect(result.last4).toBe("7890");

      const inserted = dbMock.state.inserted.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(inserted?.values).toMatchObject({
        organizationId,
        provider: "openai",
        label: "OpenAI production",
        last4: "7890",
        status: "untested",
        createdBy: userId,
      });
      const values = inserted?.values as Record<string, unknown>;
      expect(values.encryptedSecret).not.toBe(secret);
      expect(values.encryptedSecret).not.toContain(secret);
      expect(typeof values.wrappedDataKey).toBe("string");
      expect(values.keyVersion).toBe(1);

      // The stored ciphertext still decrypts to the original secret.
      const decrypted = await decryptAiCredentialSecret({
        ciphertext: {
          encryptedSecret: values.encryptedSecret as string,
          iv: values.iv as string,
          wrappedDataKey: values.wrappedDataKey as string,
          keyVersion: values.keyVersion as number,
        },
        organizationId,
        provider: "openai",
        masterKey,
      });
      expect(decrypted).toBe(secret);

      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          organizationId,
          userId,
          credentialId: "credential_1",
          action: "create",
          result: "success",
          provider: "openai",
        }),
      ]);
    });

    it("normalizes a safe custom base URL", async () => {
      const dbMock = createDbMock();
      dbMock.state.returningRow = createCredential({
        provider: "custom",
        baseUrl: "https://llm.example.com/v1/",
        status: "untested",
      });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      await caller.create({
        provider: "custom",
        label: "Gateway",
        secret,
        baseUrl: "https://llm.example.com/v1/",
      });

      expect(assertSafeAiBaseUrlMock).toHaveBeenCalledWith(
        "https://llm.example.com/v1/",
      );
      const inserted = dbMock.state.inserted.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(inserted?.values).toMatchObject({
        baseUrl: "https://llm.example.com/v1",
      });
    });

    it("rejects an unsafe custom base URL before writing", async () => {
      const dbMock = createDbMock();
      assertSafeAiBaseUrlMock.mockRejectedValueOnce(
        new Error("AI provider base URL must use https"),
      );

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          provider: "custom",
          label: "Gateway",
          secret,
          baseUrl: "http://internal.example.com/v1",
        }),
      ).rejects.toThrow("must use https");
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it("requires an account id for Cloudflare", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          provider: "cloudflare",
          label: "Cloudflare",
          secret,
        }),
      ).rejects.toThrow("account id is required");
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it("rejects provider-specific fields that do not apply", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          provider: "openai",
          label: "OpenAI",
          secret,
          baseUrl: "https://api.example.com/v1",
        }),
      ).rejects.toThrow("does not take an account id or base URL");
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });

  describe("replace", () => {
    it("replaces the secret and resets the credential to untested", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = await createEncryptedCredential();
      dbMock.state.returningRow = createCredential({
        status: "untested",
        lastTestedAt: null,
        lastTestResult: null,
        last4: "cdef",
      });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.replace({
        id: "credential_1",
        secret: "sk-new-provider-key-abcdef",
      });

      expect(result.last4).toBe("cdef");
      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({
        status: "untested",
        lastTestedAt: null,
        lastTestResult: null,
        last4: "cdef",
      });
      const values = updated?.values as Record<string, unknown>;
      expect(values.encryptedSecret).not.toContain(
        "sk-new-provider-key-abcdef",
      );
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({ action: "replace", userId }),
      ]);
    });

    it("rejects a credential from another organization", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = null;

      const caller = aiProviderRouter.createCaller(
        createCtx(dbMock.db, otherOrganizationId),
      );

      await expect(
        caller.replace({ id: "credential_1", secret }),
      ).rejects.toThrow("not found");
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes the credential and clears use-case selections", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential();
      dbMock.state.settings = {
        id: "settings_1",
        organizationId,
        chatCredentialId: "credential_1",
        chatModel: "gpt-4o-mini",
        decisionsCredentialId: "other_credential",
        decisionsModel: "gpt-4o-mini",
        backgroundCredentialId: "credential_1",
        backgroundModel: "gpt-4.1-nano",
        createdAt: now,
        updatedAt: now,
      };

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.delete({ id: "credential_1" });

      expect(result).toEqual({ success: true });
      expect(dbMock.deleteMock).toHaveBeenCalledWith(aiProviderCredential);
      const settingsUpdate = dbMock.state.updated.find(
        (entry) => entry.table === organizationAiSettings,
      );
      expect(settingsUpdate?.values).toMatchObject({
        chatCredentialId: null,
        chatModel: null,
        backgroundCredentialId: null,
        backgroundModel: null,
      });
      expect(settingsUpdate?.values).not.toHaveProperty(
        "decisionsCredentialId",
      );
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({ action: "delete", userId }),
      ]);
    });

    it("rejects a credential from another organization", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = null;

      const caller = aiProviderRouter.createCaller(
        createCtx(dbMock.db, otherOrganizationId),
      );

      await expect(caller.delete({ id: "credential_1" })).rejects.toThrow(
        "not found",
      );
      expect(dbMock.deleteMock).not.toHaveBeenCalled();
    });
  });

  describe("setUseCaseModel", () => {
    it("stores the selected credential and model after a successful test", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential({ status: "active" });
      dbMock.state.settings = null;
      dbMock.state.returningRow = {
        id: "settings_1",
        organizationId,
        chatCredentialId: "credential_1",
        chatModel: "gpt-4o-mini",
      };

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.setUseCaseModel({
        useCase: "chat",
        credentialId: "credential_1",
        model: "gpt-4o-mini",
      });

      expect(result.chat).toEqual({
        credentialId: "credential_1",
        model: "gpt-4o-mini",
      });
      const inserted = dbMock.state.inserted.find(
        (entry) => entry.table === organizationAiSettings,
      );
      expect(inserted?.values).toMatchObject({
        organizationId,
        chatCredentialId: "credential_1",
        chatModel: "gpt-4o-mini",
      });
      expect(dbMock.state.conflicts).toEqual([
        expect.objectContaining({
          target: organizationAiSettings.organizationId,
        }),
      ]);
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "set_use_case_model",
          credentialId: "credential_1",
          provider: "openai",
          userId,
        }),
      ]);
    });

    it("rejects an untested credential", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential({ status: "untested" });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.setUseCaseModel({
          useCase: "chat",
          credentialId: "credential_1",
          model: "gpt-4o-mini",
        }),
      ).rejects.toThrow("Test this credential successfully");
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it("rejects a model without a credential", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.setUseCaseModel({
          useCase: "chat",
          credentialId: null,
          model: "gpt-4o-mini",
        }),
      ).rejects.toThrow("Choose a credential");
    });

    it("rejects a credential from another organization", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = null;

      const caller = aiProviderRouter.createCaller(
        createCtx(dbMock.db, otherOrganizationId),
      );

      await expect(
        caller.setUseCaseModel({
          useCase: "chat",
          credentialId: "credential_1",
          model: "gpt-4o-mini",
        }),
      ).rejects.toThrow("not found");
    });
  });

  describe("setEnabled", () => {
    it("deactivates a credential", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential();
      dbMock.state.returningRow = createCredential({ status: "disabled" });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.setEnabled({
        id: "credential_1",
        enabled: false,
      });

      expect(result.status).toBe("disabled");
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({ action: "deactivate", userId }),
      ]);
    });

    it("reactivates only a previously tested credential", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential({
        status: "disabled",
        lastTestResult: "success",
      });
      dbMock.state.returningRow = createCredential({ status: "active" });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      await caller.setEnabled({ id: "credential_1", enabled: true });

      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({ status: "active" });
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({ action: "activate" }),
      ]);
    });

    it("does not activate an untested credential", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential({
        status: "disabled",
        lastTestResult: null,
      });
      dbMock.state.returningRow = createCredential({ status: "untested" });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      await caller.setEnabled({ id: "credential_1", enabled: true });

      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({ status: "untested" });
    });
  });

  describe("test", () => {
    it("activates a saved credential after a successful test", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = await createEncryptedCredential();

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.test({ id: "credential_1" });

      expect(result).toMatchObject({ ok: true, provider: "openai" });
      expect(testAiProviderConnectionMock).toHaveBeenCalledWith({
        provider: "openai",
        secret,
        model: undefined,
        accountId: undefined,
        baseUrl: undefined,
      });
      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({
        status: "active",
        lastTestResult: "success",
      });
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "test",
          result: "success",
          credentialId: "credential_1",
          userId,
        }),
      ]);
    });

    it("marks a failing credential and records a safe error code", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = await createEncryptedCredential();
      testAiProviderConnectionMock.mockResolvedValueOnce({
        ok: false,
        provider: "openai",
        errorCode: "invalid_credentials",
        message: "The provider rejected this API key.",
      });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.test({ id: "credential_1" });

      expect(result).toMatchObject({
        ok: false,
        errorCode: "invalid_credentials",
      });
      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({
        status: "failing",
        lastTestResult: "invalid_credentials",
      });
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "test",
          result: "failure",
          errorCode: "invalid_credentials",
        }),
      ]);
    });

    it("falls back to a failure result when the stored secret cannot be decrypted", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = createCredential({
        encryptedSecret: "not-valid-ciphertext",
        iv: "not-valid-iv",
        wrappedDataKey: "1.not.valid",
      });

      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.test({ id: "credential_1" });

      expect(result).toMatchObject({
        ok: false,
        errorCode: "invalid_configuration",
      });
      expect(testAiProviderConnectionMock).not.toHaveBeenCalled();
      const updated = dbMock.state.updated.find(
        (entry) => entry.table === aiProviderCredential,
      );
      expect(updated?.values).toMatchObject({
        status: "failing",
        lastTestResult: "decryption_failed",
      });
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "test",
          result: "failure",
          errorCode: "decryption_failed",
        }),
      ]);
    });

    it("rejects a saved credential from another organization", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = null;

      const caller = aiProviderRouter.createCaller(
        createCtx(dbMock.db, otherOrganizationId),
      );

      await expect(caller.test({ id: "credential_1" })).rejects.toThrow(
        "not found",
      );
      expect(testAiProviderConnectionMock).not.toHaveBeenCalled();
    });

    it("rejects mixing a saved credential id with a plaintext secret", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      await expect(caller.test({ id: "credential_1", secret })).rejects.toThrow(
        "Provide either a saved credential id",
      );
      expect(testAiProviderConnectionMock).not.toHaveBeenCalled();
    });

    it("tests an unsaved secret without storing it", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.test({ provider: "openai", secret });

      expect(result).toMatchObject({ ok: true, provider: "openai" });
      expect(dbMock.insert).toHaveBeenCalledTimes(1);
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "test",
          result: "success",
          credentialId: null,
          provider: "openai",
          userId,
        }),
      ]);
      const audit = dbMock.state.auditRows[0] as Record<string, unknown>;
      expect(JSON.stringify(audit)).not.toContain(secret);
    });

    it("rejects an unsaved custom test without a base URL", async () => {
      const dbMock = createDbMock();
      const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.test({ provider: "custom", secret });

      expect(result).toMatchObject({
        ok: false,
        errorCode: "invalid_configuration",
      });
      expect(testAiProviderConnectionMock).not.toHaveBeenCalled();
      expect(dbMock.state.auditRows).toEqual([
        expect.objectContaining({
          action: "test",
          result: "failure",
          errorCode: "invalid_configuration",
        }),
      ]);
    });

    it("never leaks the secret into results, audits, logs or analytics", async () => {
      const dbMock = createDbMock();
      dbMock.state.credential = await createEncryptedCredential();
      testAiProviderConnectionMock.mockResolvedValueOnce({
        ok: false,
        provider: "openai",
        errorCode: "invalid_credentials",
        message: "The provider rejected this API key.",
      });

      const originalLog = console.log;
      const logLines: unknown[][] = [];
      console.log = (...args: unknown[]) => {
        logLines.push(args);
      };

      let result: unknown;
      try {
        const caller = aiProviderRouter.createCaller(createCtx(dbMock.db));
        result = await caller.test({ id: "credential_1" });
      } finally {
        console.log = originalLog;
      }

      expect(JSON.stringify(result)).not.toContain(secret);
      expect(JSON.stringify(dbMock.state.auditRows)).not.toContain(secret);
      expect(JSON.stringify(logLines)).not.toContain(secret);
      expect(JSON.stringify(captureExceptionMock.mock.calls)).not.toContain(
        secret,
      );
    });
  });
});

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createConversationToken } from "@convoform/common";

const secret = "conversation-router-test-secret";
process.env.INTERNAL_EMAIL_API_SECRET = secret;

const { BETA_LIMITS } = await import("@convoform/file-storage/constants");

mock.module("@convoform/file-storage", () => ({
  BETA_LIMITS,
  fileStorageService: {},
}));

const { getConversationTokenCookieName } = await import(
  "../src/lib/conversationToken"
);
const { conversationRouter } = await import("../src/router/conversation");
const { fileUploadRouter } = await import("../src/router/fileUpload");

const conversationId = "conv_1";
const organizationId = "org_1";
const formId = "form_1";

function buildHeaders(token?: string) {
  const headers = new Headers();
  if (token) {
    headers.set(
      "cookie",
      `${getConversationTokenCookieName(conversationId)}=${token}`,
    );
  }

  return headers;
}

async function createToken(forConversationId = conversationId) {
  return await createConversationToken(
    {
      conversationId: forConversationId,
      organizationId,
      formId,
    },
    { secret },
  );
}

function createContext({
  token,
  orgId = null,
  userId = null,
  db = {},
}: {
  token?: string;
  orgId?: string | null;
  userId?: string | null;
  db?: any;
} = {}) {
  return {
    db,
    auth: {
      userId,
      orgId,
    },
    user: userId ? { id: userId } : null,
    headers: buildHeaders(token),
  } as any;
}

function createUpdateDb() {
  const returning = mock(() =>
    Promise.resolve([{ id: conversationId, updatedAt: new Date() }]),
  );
  const where = mock(() => ({ returning }));
  const set = mock(() => ({ where }));
  const update = mock(() => ({ set }));

  return {
    db: { update },
    update,
    set,
    where,
    returning,
  };
}

function createGetOneDb(row: Record<string, unknown> | null) {
  const findFirst = mock(() => Promise.resolve(row));

  return {
    db: {
      query: {
        conversation: {
          findFirst,
        },
      },
    },
    findFirst,
  };
}

function createCountDb(value: number) {
  const where = mock(() => Promise.resolve([{ value }]));
  const from = mock(() => ({ where }));
  const select = mock(() => ({ from }));

  return { db: { select }, select, from, where };
}

const conversationRow = {
  id: conversationId,
  organizationId,
  formId,
  transcript: [],
  formFieldResponses: [],
  metaData: {},
  finishedAt: null,
};

describe("conversation router authorization", () => {
  let token: string;

  beforeEach(async () => {
    process.env.INTERNAL_EMAIL_API_SECRET = secret;
    token = await createToken();
  });

  it("rejects conversation writes without a conversation token", async () => {
    const caller = conversationRouter.createCaller(createContext());

    await expect(
      caller.updateInProgressStatus({
        id: conversationId,
        isInProgress: false,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    await expect(
      caller.generateInsights({ conversationId }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts writes with the token for that conversation", async () => {
    const { db, update } = createUpdateDb();
    const caller = conversationRouter.createCaller(
      createContext({ token, db }),
    );

    await caller.updateInProgressStatus({
      id: conversationId,
      isInProgress: false,
    });

    expect(update).toHaveBeenCalledTimes(1);
  });

  it("rejects a token issued for another conversation", async () => {
    const { db, update } = createUpdateDb();
    const wrongToken = await createToken("conv_other");
    const caller = conversationRouter.createCaller(
      createContext({ token: wrongToken, db }),
    );

    await expect(
      caller.updateInProgressStatus({
        id: conversationId,
        isInProgress: false,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    expect(update).not.toHaveBeenCalled();
  });

  it("allows getOne with a valid token", async () => {
    const { db } = createGetOneDb(conversationRow);
    const caller = conversationRouter.createCaller(
      createContext({ token, db }),
    );

    const result = await caller.getOne({ id: conversationId });

    expect(result?.organizationId).toBe(organizationId);
  });

  it("scopes getOne to the caller's organization", async () => {
    const { db } = createGetOneDb(conversationRow);

    const sameOrgCaller = conversationRouter.createCaller(
      createContext({ db, userId: "user_1", orgId: organizationId }),
    );
    await expect(
      sameOrgCaller.getOne({ id: conversationId }),
    ).resolves.toMatchObject({ id: conversationId });

    const otherOrgCaller = conversationRouter.createCaller(
      createContext({ db, userId: "user_2", orgId: "org_2" }),
    );
    await expect(
      otherOrgCaller.getOne({ id: conversationId }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects getOne without a token or organization session", async () => {
    const { db } = createGetOneDb(conversationRow);
    const caller = conversationRouter.createCaller(createContext({ db }));

    await expect(caller.getOne({ id: conversationId })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("allows getCountByOrganizationId only for organization members", async () => {
    const { db, select } = createCountDb(12);
    const memberCaller = conversationRouter.createCaller(
      createContext({ db, userId: "user_1", orgId: organizationId }),
    );

    await expect(
      memberCaller.getCountByOrganizationId({ organizationId }),
    ).resolves.toBe(12);
    expect(select).toHaveBeenCalledTimes(1);

    await expect(
      memberCaller.getCountByOrganizationId({ organizationId: "org_2" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const tokenOnlyCaller = conversationRouter.createCaller(
      createContext({ token, db }),
    );
    await expect(
      tokenOnlyCaller.getCountByOrganizationId({ organizationId }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects file uploads without the conversation token", async () => {
    const findFirst = mock(() => Promise.resolve(conversationRow));
    const db = { query: { conversation: { findFirst } } };
    const caller = fileUploadRouter.createCaller(createContext({ db }));

    await expect(
      caller.uploadFile({
        fileName: "answer.pdf",
        fileType: "application/pdf",
        fileSize: 1024,
        fileBuffer: "AA==",
        conversationId,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    expect(findFirst).not.toHaveBeenCalled();
  });

  it("throws instead of signing with an empty secret", async () => {
    const previousTokenSecret = process.env.CONVERSATION_TOKEN_SECRET;
    const previousInternalSecret = process.env.INTERNAL_EMAIL_API_SECRET;

    try {
      Reflect.deleteProperty(process.env, "CONVERSATION_TOKEN_SECRET");
      Reflect.deleteProperty(process.env, "INTERNAL_EMAIL_API_SECRET");

      const { getConversationTokenSigningSecret } = await import(
        "../src/lib/conversationToken"
      );

      expect(() => getConversationTokenSigningSecret()).toThrow(
        "CONVERSATION_TOKEN_SECRET or INTERNAL_EMAIL_API_SECRET must be set",
      );
    } finally {
      if (previousTokenSecret === undefined) {
        Reflect.deleteProperty(process.env, "CONVERSATION_TOKEN_SECRET");
      } else {
        process.env.CONVERSATION_TOKEN_SECRET = previousTokenSecret;
      }

      if (previousInternalSecret === undefined) {
        Reflect.deleteProperty(process.env, "INTERNAL_EMAIL_API_SECRET");
      } else {
        process.env.INTERNAL_EMAIL_API_SECRET = previousInternalSecret;
      }
    }
  });
});

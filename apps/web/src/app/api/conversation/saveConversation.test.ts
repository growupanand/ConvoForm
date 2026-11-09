import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const loggerInfoMock = mock(() => undefined);
const loggerErrorMock = mock(() => undefined);
const loggerWarnMock = mock(() => undefined);
const loggerFlushMock = mock(() => Promise.resolve());

mock.module("@convoform/logger", () => ({
  createConversationLogger: mock(() => ({
    info: loggerInfoMock,
    error: loggerErrorMock,
    warn: loggerWarnMock,
    flush: loggerFlushMock,
  })),
}));

mock.module("@convoform/api/src/actions/conversation", () => ({
  patchConversation: mock(() => Promise.resolve()),
}));

mock.module("@convoform/api/src/env", () => ({
  env: { INTERNAL_EMAIL_API_SECRET: "super-secret-token" },
}));

mock.module("@convoform/db", () => ({
  db: {},
  createDb: mock(),
}));

const getAPIDomainUrlMock = mock(() => "wss://realtime.convoform.com");

mock.module("@convoform/websocket-client", () => ({
  getAPIDomainUrl: getAPIDomainUrlMock,
}));

const { broadcastConversationUpdated, saveConversationWithRetry } =
  await import("./saveConversation");

function buildConversation(
  overrides: Partial<{
    id: string;
    finishedAt: Date | null;
    transcript: Array<{ role: string; content: string }>;
  }> = {},
) {
  return {
    id: "conv_1",
    formId: "form_1",
    organizationId: "org_1",
    transcript: [
      { role: "assistant", content: "What is your name?" },
      { role: "user", content: "Ada" },
    ],
    formFieldResponses: [],
    finishedAt: null,
    ...overrides,
  } as any;
}

function createFreshDbMock() {
  const endMock = mock(() => Promise.resolve());
  const createFreshDb = mock(() => ({
    db: { fresh: true } as any,
    pool: { end: endMock },
  }));

  return { createFreshDb, endMock };
}

const noopOnConversationUpdated = async () => undefined;

describe("saveConversationWithRetry", () => {
  beforeEach(() => {
    loggerInfoMock.mockClear();
    loggerErrorMock.mockClear();
    loggerWarnMock.mockClear();
    loggerFlushMock.mockClear();
    getAPIDomainUrlMock.mockClear();
  });

  it("logs a successful save once and does not retry", async () => {
    const patchMock = mock(() => Promise.resolve());
    const { createFreshDb } = createFreshDbMock();

    const result = await saveConversationWithRetry(
      buildConversation(),
      { db: {} as any },
      {
        patch: patchMock as any,
        createFreshDb: createFreshDb as any,
        timeoutMs: 100,
        onConversationUpdated: noopOnConversationUpdated,
      },
    );

    expect(result).toBe(true);
    expect(patchMock).toHaveBeenCalledTimes(1);
    expect(createFreshDb).not.toHaveBeenCalled();
    expect(loggerInfoMock).toHaveBeenCalledWith("conversation:patch:ok", {
      conversationId: "conv_1",
      transcriptLength: 2,
      finished: false,
    });
  });

  it("logs a timeout and retries once with a fresh connection", async () => {
    const patchMock = mock(() => new Promise(() => undefined));
    const { createFreshDb, endMock } = createFreshDbMock();

    const result = await saveConversationWithRetry(
      buildConversation({ finishedAt: new Date() }),
      { db: {} as any },
      {
        patch: patchMock as any,
        createFreshDb: createFreshDb as any,
        timeoutMs: 5,
        retryTimeoutMs: 5,
        onConversationUpdated: noopOnConversationUpdated,
      },
    );

    expect(result).toBe(false);
    expect(patchMock).toHaveBeenCalledTimes(2);
    expect(createFreshDb).toHaveBeenCalledTimes(1);
    expect(endMock).toHaveBeenCalledTimes(1);
    expect(loggerErrorMock).toHaveBeenCalledWith("conversation:patch:timeout", {
      conversationId: "conv_1",
      hasFinishedAt: true,
    });
    expect(loggerFlushMock).toHaveBeenCalled();
  });

  it("retries a failed save with the fresh connection", async () => {
    const patchMock = mock(() => Promise.reject(new Error("socket hang up")));
    const { createFreshDb, endMock } = createFreshDbMock();
    patchMock.mockImplementationOnce(() =>
      Promise.reject(new Error("socket hang up")),
    );
    patchMock.mockImplementationOnce(() => Promise.resolve());

    const result = await saveConversationWithRetry(
      buildConversation(),
      { db: { initial: true } as any },
      {
        patch: patchMock as any,
        createFreshDb: createFreshDb as any,
        timeoutMs: 100,
        onConversationUpdated: noopOnConversationUpdated,
      },
    );

    expect(result).toBe(true);
    expect(patchMock).toHaveBeenCalledTimes(2);
    expect(patchMock.mock.calls[1]?.[1]).toEqual({
      db: { fresh: true },
    });
    expect(loggerErrorMock).toHaveBeenCalledWith("conversation:patch:failed", {
      conversationId: "conv_1",
      error: "socket hang up",
    });
    expect(loggerInfoMock).toHaveBeenCalledWith(
      "conversation:patch:ok",
      expect.objectContaining({ conversationId: "conv_1" }),
    );
    expect(createFreshDb).toHaveBeenCalledTimes(1);
    expect(endMock).toHaveBeenCalledTimes(1);
  });
});

describe("broadcastConversationUpdated", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    loggerWarnMock.mockClear();
    loggerFlushMock.mockClear();
    getAPIDomainUrlMock.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("resolves the production fallback URL and warns on a non-ok response", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(new Response("unavailable", { status: 503 })),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    await broadcastConversationUpdated({ id: "conv_1", formId: "form_1" });

    expect(getAPIDomainUrlMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://realtime.convoform.com/broadcast",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer super-secret-token",
        }),
      }),
    );
    expect(loggerWarnMock).toHaveBeenCalledWith(
      "conversation:broadcast:failed",
      {
        conversationId: "conv_1",
        formId: "form_1",
        status: 503,
      },
    );

    const loggedPayload = JSON.stringify(loggerWarnMock.mock.calls);
    expect(loggedPayload).not.toContain("super-secret-token");
  });
});

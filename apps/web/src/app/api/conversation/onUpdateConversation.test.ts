import { beforeEach, describe, expect, it, mock } from "bun:test";

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
  env: { INTERNAL_EMAIL_API_SECRET: "secret" },
}));

mock.module("@convoform/db", () => ({
  db: {},
  createDb: mock(),
}));

mock.module("@convoform/websocket-client", () => ({
  getAPIDomainUrl: mock(() => "wss://realtime.convoform.com"),
}));

const { getOnUpdateConversationHandler } = await import(
  "./onUpdateConversation"
);

function buildConversation(
  transcript: Array<{ role: string; content: string }>,
) {
  return {
    id: "conv_1",
    formId: "form_1",
    organizationId: "org_1",
    transcript,
    formFieldResponses: [],
    finishedAt: null,
  } as any;
}

describe("getOnUpdateConversationHandler", () => {
  beforeEach(() => {
    loggerInfoMock.mockClear();
    loggerErrorMock.mockClear();
    loggerWarnMock.mockClear();
    loggerFlushMock.mockClear();
  });

  it("saves once per request with the latest conversation snapshot", async () => {
    const scheduled: Array<() => Promise<void>> = [];
    const saveMock = mock(() => Promise.resolve(true));
    const writer = { write: mock(() => undefined) } as any;
    const handler = getOnUpdateConversationHandler(
      writer,
      { db: {} as any },
      {
        scheduleAfter: (task) => scheduled.push(task),
        save: saveMock as any,
      },
    );

    const first = buildConversation([{ role: "user", content: "first" }]);
    const second = buildConversation([
      { role: "user", content: "first" },
      { role: "assistant", content: "second" },
    ]);
    const latest = buildConversation([
      { role: "user", content: "first" },
      { role: "assistant", content: "second" },
      { role: "user", content: "latest" },
    ]);

    await handler(first);
    await handler(second);
    await handler(latest);

    expect(scheduled).toHaveLength(1);
    expect(writer.write).toHaveBeenCalledTimes(3);

    await scheduled[0]?.();

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock.mock.calls[0]?.[0]).toEqual(latest);
  });

  it("schedules a new save after the previous after() task runs", async () => {
    const scheduled: Array<() => Promise<void>> = [];
    const writer = { write: mock(() => undefined) } as any;
    const handler = getOnUpdateConversationHandler(
      writer,
      { db: {} as any },
      {
        scheduleAfter: (task) => scheduled.push(task),
        save: mock(() => Promise.resolve(true)) as any,
      },
    );

    await handler(buildConversation([]));
    await scheduled[0]?.();
    await handler(buildConversation([{ role: "user", content: "next" }]));

    expect(scheduled).toHaveLength(2);
  });

  it("logs writer failures through the conversation logger", async () => {
    const writer = {
      write: mock(() => {
        throw new Error("stream closed");
      }),
    } as any;
    const handler = getOnUpdateConversationHandler(
      writer,
      { db: {} as any },
      {
        scheduleAfter: () => undefined,
        save: mock(() => Promise.resolve(true)) as any,
      },
    );

    await handler(buildConversation([]));

    expect(loggerErrorMock).toHaveBeenCalledWith("conversation:patch:failed", {
      conversationId: "conv_1",
      error: "stream closed",
    });
    expect(loggerFlushMock).toHaveBeenCalled();
  });
});

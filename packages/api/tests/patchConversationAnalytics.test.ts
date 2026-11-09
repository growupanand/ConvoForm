import { beforeEach, describe, expect, it, mock } from "bun:test";

const trackMock = mock(() => Promise.resolve());
const captureExceptionMock = mock(() => Promise.resolve());
const sendFormResponseMock = mock(() => Promise.resolve());
const loggerInfoMock = mock(() => undefined);
const loggerErrorMock = mock(() => undefined);
const loggerFlushMock = mock(() => Promise.resolve());

mock.module("@convoform/logger", () => ({
  createConversationLogger: mock(() => ({
    info: loggerInfoMock,
    error: loggerErrorMock,
    flush: loggerFlushMock,
  })),
}));

mock.module("@convoform/db/src/env", () => ({
  env: { DATABASE_URL: "postgresql://localhost/test" },
  databaseEnvSchema: {},
}));

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: trackMock,
    captureException: captureExceptionMock,
  },
}));

mock.module("../src/lib/trpc-client", () => ({
  trpcFetchClient: {
    integration: { sync: { mutate: mock() } },
    email: { sendFormResponse: { mutate: sendFormResponseMock } },
  },
}));

mock.module("../src/env", () => ({
  env: { INTERNAL_EMAIL_API_SECRET: "secret" },
}));

const generateAndSaveInsightsMock = mock(() =>
  Promise.resolve({ success: true, skipped: false }),
);

const createWebhookDeliveriesMock = mock(() => Promise.resolve([]));

mock.module("../src/actions/conversation/generateAndSaveInsights", () => ({
  generateAndSaveInsights: generateAndSaveInsightsMock,
}));

mock.module("../src/actions/webhook/createWebhookDeliveries", () => ({
  createWebhookDeliveriesForCompletedConversation: createWebhookDeliveriesMock,
}));

describe("patchConversation analytics", () => {
  beforeEach(() => {
    trackMock.mockClear();
    captureExceptionMock.mockClear();
    sendFormResponseMock.mockClear();
    createWebhookDeliveriesMock.mockClear();
    generateAndSaveInsightsMock.mockClear();
    loggerInfoMock.mockClear();
    loggerErrorMock.mockClear();
    loggerFlushMock.mockClear();
  });

  it("emits conversation:complete once for the form owner on first finish", async () => {
    generateAndSaveInsightsMock.mockClear();
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const finishedAt = new Date();
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: { isOwnerPreview: true },
    };

    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: { isOwnerPreview: true },
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock(() => Promise.resolve([updatedRow])),
          }),
        }),
      }),
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          innerJoin: mock().mockReturnValue({
            where: mock().mockReturnValue({
              limit: mock(() =>
                Promise.resolve([
                  {
                    userEmail: "owner@example.com",
                    formName: "Form",
                  },
                ]),
              ),
            }),
          }),
        }),
      }),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation(
      {
        id: "conv_1",
        finishedAt,
      } as any,
      { db: mockDb as any },
    );

    expect(trackMock).toHaveBeenCalledWith(
      "conversation:update",
      expect.any(Object),
    );
    expect(trackMock).toHaveBeenCalledWith("conversation:complete", {
      distinctId: "conv_1",
      groups: { organization: "org_1" },
      properties: expect.objectContaining({
        formId: "form_1",
        conversationId: "conv_1",
        isOwnerPreview: true,
      }),
    });
    expect(trackMock.mock.calls.length).toBe(2);
    expect(generateAndSaveInsightsMock).toHaveBeenCalledTimes(1);
    expect(createWebhookDeliveriesMock).not.toHaveBeenCalled();
  });

  it("creates webhook deliveries before insights even when insights throws", async () => {
    const order: string[] = [];
    createWebhookDeliveriesMock.mockImplementationOnce(async () => {
      order.push("webhook");
      return [];
    });
    generateAndSaveInsightsMock.mockImplementationOnce(async () => {
      order.push("insights");
      throw new Error("LLM unavailable");
    });
    sendFormResponseMock.mockImplementationOnce(async () => {
      order.push("email");
    });

    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const finishedAt = new Date();
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: {},
    };

    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: {},
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock(() => Promise.resolve([updatedRow])),
          }),
        }),
      }),
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          innerJoin: mock().mockReturnValue({
            where: mock().mockReturnValue({
              limit: mock(() =>
                Promise.resolve([
                  {
                    userEmail: "owner@example.com",
                  },
                ]),
              ),
            }),
          }),
        }),
      }),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation(
      {
        id: "conv_1",
        finishedAt,
      } as any,
      { db: mockDb as any },
      {
        onConversationUpdated: async () => {
          order.push("broadcast");
        },
      },
    );

    expect(createWebhookDeliveriesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "conv_1",
        formId: "form_1",
        organizationId: "org_1",
        isOwnerPreview: false,
      }),
      expect.objectContaining({ db: mockDb }),
    );
    expect(generateAndSaveInsightsMock).toHaveBeenCalledTimes(1);
    expect(sendFormResponseMock).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["broadcast", "webhook", "insights", "email"]);
    expect(loggerErrorMock).toHaveBeenCalledWith("insights:failed", {
      trigger: "completed",
      error: "LLM unavailable",
    });
  });

  it("does not emit conversation:update after the conversation is already finished", async () => {
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const finishedAt = new Date();
    const existingRow = {
      finishedAt,
      metaData: {},
    };

    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: {},
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock(() => Promise.resolve([updatedRow])),
          }),
        }),
      }),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    trackMock.mockClear();

    await patchConversation(
      {
        id: "conv_1",
        finishedAt,
        transcript: [{ role: "user", content: "late patch" }],
      } as any,
      { db: mockDb as any },
    );

    expect(trackMock).not.toHaveBeenCalled();
  });

  it("reports email send failures with safe context and no recipient PII", async () => {
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const emailError = new Error(
      "Resend rejected the email request (validation_error, status 422)",
    );
    sendFormResponseMock.mockImplementationOnce(() =>
      Promise.reject(emailError),
    );

    const finishedAt = new Date();
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: {},
    };

    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: {},
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockReturnValue({
            returning: mock(() => Promise.resolve([updatedRow])),
          }),
        }),
      }),
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          innerJoin: mock().mockReturnValue({
            where: mock().mockReturnValue({
              limit: mock(() =>
                Promise.resolve([
                  {
                    userEmail: "owner@example.com",
                    formName: "Contact form",
                  },
                ]),
              ),
            }),
          }),
        }),
      }),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation(
      {
        id: "conv_1",
        finishedAt,
      } as any,
      { db: mockDb as any },
    );

    expect(captureExceptionMock).toHaveBeenCalledWith(emailError, "conv_1");
    expect(trackMock).toHaveBeenCalledWith("email:sendFailed", {
      distinctId: "conv_1",
      groups: { organization: "org_1" },
      properties: {
        conversationId: "conv_1",
        formId: "form_1",
        organizationId: "org_1",
      },
    });

    const analyticsPayload = JSON.stringify([
      trackMock.mock.calls,
      captureExceptionMock.mock.calls.map(([error]) => ({
        message: error instanceof Error ? error.message : String(error),
      })),
    ]);
    expect(analyticsPayload).not.toContain("owner@example.com");
    expect(analyticsPayload).not.toContain("Contact form");

    expect(createWebhookDeliveriesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "conv_1",
        formId: "form_1",
        organizationId: "org_1",
      }),
      expect.objectContaining({ db: mockDb }),
    );
  });

  it("does not overwrite isInProgress from an in-progress stream snapshot", async () => {
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const setCalls: Record<string, unknown>[] = [];
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: {},
    };
    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt: null,
      metaData: {},
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock(() => ({
        set: mock((values: Record<string, unknown>) => {
          setCalls.push(values);
          return {
            where: mock(() => ({
              returning: mock(() => Promise.resolve([updatedRow])),
            })),
          };
        }),
      })),
      select: mock(() => ({
        from: mock(() => ({
          innerJoin: mock(() => ({
            where: mock(() => ({
              limit: mock(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation(
      {
        id: "conv_1",
        isInProgress: false,
        formFieldResponses: [],
      } as any,
      { db: mockDb as any },
    );

    expect(setCalls[0]).not.toHaveProperty("isInProgress");
    expect(setCalls[0]?.updatedAt).toBeInstanceOf(Date);
  });

  it("marks the conversation not in progress when it finishes", async () => {
    const { patchConversation } = await import(
      "../src/actions/conversation/patchConversation"
    );

    const setCalls: Record<string, unknown>[] = [];
    const finishedAt = new Date();
    const existingRow = {
      finishedAt: null as Date | null,
      metaData: {},
    };
    const updatedRow = {
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt,
      metaData: {},
      transcript: [],
      formFieldResponses: [],
    };

    const mockTx = {
      execute: mock(() => Promise.resolve()),
      query: {
        conversation: {
          findFirst: mock(() => Promise.resolve(existingRow)),
        },
      },
      update: mock(() => ({
        set: mock((values: Record<string, unknown>) => {
          setCalls.push(values);
          return {
            where: mock(() => ({
              returning: mock(() => Promise.resolve([updatedRow])),
            })),
          };
        }),
      })),
      select: mock(() => ({
        from: mock(() => ({
          innerJoin: mock(() => ({
            where: mock(() => ({
              limit: mock(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    };

    const mockDb = {
      transaction: mock((cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      ),
    };

    await patchConversation({ id: "conv_1", finishedAt } as any, {
      db: mockDb as any,
    });

    expect(setCalls[0]).toHaveProperty("isInProgress", false);
  });
});

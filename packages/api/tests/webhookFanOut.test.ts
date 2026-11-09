import { beforeEach, describe, expect, it, mock } from "bun:test";

const captureExceptionMock = mock(() => Promise.resolve());
const loggerInfoMock = mock(() => undefined);
const loggerErrorMock = mock(() => undefined);
const loggerFlushMock = mock(() => Promise.resolve());

const loggerMock = {
  info: loggerInfoMock,
  error: loggerErrorMock,
  flush: loggerFlushMock,
};

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: mock(() => Promise.resolve()),
    captureException: captureExceptionMock,
  },
}));

mock.module("@convoform/logger", () => ({
  createConversationLogger: mock(() => loggerMock),
}));

const { createWebhookDeliveriesForCompletedConversation } = await import(
  "../src/actions/webhook/createWebhookDeliveries"
);

const conversation = {
  id: "conversation_1",
  formId: "form_1",
  organizationId: "org_1",
  channelType: null,
  metaData: {},
};

function createDbMock({
  endpoints = [{ id: "endpoint_1" }, { id: "endpoint_2" }] as Array<{
    id: string;
  }>,
  inserted = [{ id: "delivery_1" }, { id: "delivery_2" }] as Array<{
    id: string;
  }>,
} = {}) {
  const findMany = mock(() => Promise.resolve(endpoints));
  const values = mock(() => ({
    onConflictDoNothing: mock(() => ({
      returning: mock(() => Promise.resolve(inserted)),
    })),
  }));
  const insert = mock(() => ({ values }));

  return {
    db: {
      query: {
        webhookEndpoint: {
          findMany,
        },
      },
      insert,
    } as any,
    findMany,
    insert,
    values,
  };
}

describe("webhook fan-out", () => {
  beforeEach(() => {
    captureExceptionMock.mockClear();
    loggerInfoMock.mockClear();
    loggerErrorMock.mockClear();
    loggerFlushMock.mockClear();
  });

  it("creates one delivery per enabled endpoint and dispatches each", async () => {
    const dbMock = createDbMock();
    const deliver = mock(() => Promise.resolve());

    const deliveries = await createWebhookDeliveriesForCompletedConversation(
      conversation,
      { db: dbMock.db },
      deliver,
    );

    expect(deliveries).toEqual([{ id: "delivery_1" }, { id: "delivery_2" }]);
    expect(dbMock.values).toHaveBeenCalledWith([
      {
        endpointId: "endpoint_1",
        conversationId: "conversation_1",
        organizationId: "org_1",
        eventType: "response.completed",
      },
      {
        endpointId: "endpoint_2",
        conversationId: "conversation_1",
        organizationId: "org_1",
        eventType: "response.completed",
      },
    ]);
    expect(deliver).toHaveBeenCalledTimes(2);
    expect(deliver).toHaveBeenCalledWith("delivery_1", { db: dbMock.db });
    expect(deliver).toHaveBeenCalledWith("delivery_2", { db: dbMock.db });

    expect(loggerInfoMock).toHaveBeenCalledWith("webhook:fanout:start", {
      conversationId: "conversation_1",
      formId: "form_1",
      isOwnerPreview: false,
    });
    expect(loggerInfoMock).toHaveBeenCalledWith("webhook:fanout:endpoints", {
      count: 2,
      endpointIds: ["endpoint_1", "endpoint_2"],
    });
    expect(loggerInfoMock).toHaveBeenCalledWith("webhook:fanout:created", {
      deliveryIds: ["delivery_1", "delivery_2"],
    });
    expect(loggerFlushMock).toHaveBeenCalled();
  });

  it("does nothing when the form has no enabled endpoints", async () => {
    const dbMock = createDbMock({ endpoints: [] });
    const deliver = mock(() => Promise.resolve());

    const deliveries = await createWebhookDeliveriesForCompletedConversation(
      conversation,
      { db: dbMock.db },
      deliver,
    );

    expect(deliveries).toEqual([]);
    expect(dbMock.insert).not.toHaveBeenCalled();
    expect(deliver).not.toHaveBeenCalled();
  });

  it("only dispatches rows that were actually inserted", async () => {
    const dbMock = createDbMock({
      inserted: [{ id: "delivery_1" }],
    });
    const deliver = mock(() => Promise.resolve());

    const deliveries = await createWebhookDeliveriesForCompletedConversation(
      conversation,
      { db: dbMock.db },
      deliver,
    );

    expect(deliveries).toEqual([{ id: "delivery_1" }]);
    expect(deliver).toHaveBeenCalledTimes(1);
  });

  it("logs dispatch failures without failing the fan-out", async () => {
    const dbMock = createDbMock({
      inserted: [{ id: "delivery_1" }],
    });
    const deliver = mock(() => Promise.reject(new Error("dispatch failed")));

    await createWebhookDeliveriesForCompletedConversation(
      conversation,
      { db: dbMock.db },
      deliver,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loggerErrorMock).toHaveBeenCalledWith("webhook:fanout:failed", {
      deliveryId: "delivery_1",
      error: "dispatch failed",
    });
    expect(captureExceptionMock).toHaveBeenCalled();
    expect(loggerFlushMock).toHaveBeenCalled();
  });

  it("logs insert failures and rethrows them", async () => {
    const dbMock = createDbMock();
    dbMock.insert.mockImplementationOnce(() => {
      throw new Error("insert failed");
    });
    const deliver = mock(() => Promise.resolve());

    await expect(
      createWebhookDeliveriesForCompletedConversation(
        conversation,
        { db: dbMock.db },
        deliver,
      ),
    ).rejects.toThrow("insert failed");

    expect(loggerErrorMock).toHaveBeenCalledWith("webhook:fanout:failed", {
      error: "insert failed",
    });
    expect(loggerFlushMock).toHaveBeenCalled();
    expect(deliver).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, mock } from "bun:test";

const captureExceptionMock = mock(() => Promise.resolve());

mock.module("@convoform/analytics", () => ({
  analytics: {
    track: mock(() => Promise.resolve()),
    captureException: captureExceptionMock,
  },
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
});

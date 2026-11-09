import { beforeEach, describe, expect, it, mock } from "bun:test";
import * as actualCommon from "@convoform/common";

const assertSafeWebhookUrlMock = mock(async (url: string) => new URL(url));
const deliverWebhookMock = mock(async () => undefined);

// Keep the real encrypt/decrypt/signature helpers so this mock cannot break
// other test files that import @convoform/common. Only the DNS check is
// replaced to keep router tests offline.
mock.module("@convoform/common", () => ({
  ...actualCommon,
  assertSafeWebhookUrl: assertSafeWebhookUrlMock,
}));

mock.module("../src/env", () => ({
  env: {
    ENCRYPTION_KEY: "test-encryption-key",
  },
}));

mock.module("../src/actions/webhook/deliverWebhook", () => ({
  deliverWebhook: deliverWebhookMock,
}));

import { webhookEndpointRouter } from "../src/router/webhookEndpoint";

const mockOrganizationId = "org_123";
const mockUserId = "user_123";
const mockFormId = "form_123";

const now = new Date("2026-11-09T10:00:00.000Z");

function createEndpoint(overrides: Record<string, unknown> = {}) {
  return {
    id: "endpoint_1",
    formId: mockFormId,
    organizationId: mockOrganizationId,
    url: "https://example.com/webhooks/convoform",
    encryptedSecret: "encrypted_secret",
    enabled: true,
    consecutiveFailures: 0,
    disabledAt: null,
    disabledReason: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createDbMock() {
  const state = {
    enabledCount: 0,
    deliveryItems: [] as unknown[],
    deliveryTotal: 0,
    conversationDeliveries: [] as unknown[],
  };

  const limit = mock(() => ({ offset: mock(async () => state.deliveryItems) }));
  const orderBy = mock(() => ({ limit }));
  const itemsWhere = mock(() => ({ orderBy }));
  const itemsFrom = mock(() => ({ where: itemsWhere }));

  const conversationDeliveryOrderBy = mock(
    async () => state.conversationDeliveries,
  );
  const conversationDeliveryWhere = mock(() => ({
    orderBy: conversationDeliveryOrderBy,
  }));
  const conversationDeliveryInnerJoin = mock(() => ({
    where: conversationDeliveryWhere,
  }));
  const conversationDeliveryFrom = mock(() => ({
    innerJoin: conversationDeliveryInnerJoin,
  }));

  let selectCallCount = 0;
  const select = mock((fields: Record<string, unknown>) => {
    selectCallCount++;

    if (fields && "endpointUrl" in fields) {
      return { from: conversationDeliveryFrom };
    }

    if (fields && "value" in fields) {
      // create() runs a single count query. deliveries() runs the item query
      // first, then the total count.
      const value =
        selectCallCount === 1 ? state.enabledCount : state.deliveryTotal;

      return {
        from: mock(() => ({
          where: mock(async () => [{ value }]),
        })),
      };
    }

    return { from: itemsFrom };
  });

  const insertReturning = mock(async () => [] as unknown[]);
  const insertValues = mock(() => ({ returning: insertReturning }));
  const insert = mock(() => ({ values: insertValues }));

  const updateWhere = mock(async () => undefined);
  const updateSet = mock(() => ({ where: updateWhere }));
  const update = mock(() => ({ set: updateSet }));

  const deleteWhere = mock(async () => undefined);
  const deleteMock = mock(() => ({ where: deleteWhere }));

  const formFindFirst = mock(async () => ({ id: mockFormId }));
  const conversationFindFirst = mock(async () => ({
    id: "conversation_1",
    formId: mockFormId,
  }));
  const endpointFindFirst = mock(async () => null as unknown);
  const endpointFindMany = mock(async () => [] as unknown[]);

  const db = {
    query: {
      form: { findFirst: formFindFirst },
      conversation: { findFirst: conversationFindFirst },
      webhookEndpoint: {
        findFirst: endpointFindFirst,
        findMany: endpointFindMany,
      },
    },
    select,
    insert,
    update,
    delete: deleteMock,
  };

  return {
    db,
    state,
    formFindFirst,
    conversationFindFirst,
    endpointFindFirst,
    endpointFindMany,
    select,
    insert,
    insertValues,
    insertReturning,
    update,
    updateSet,
    updateWhere,
    deleteMock,
    deleteWhere,
    limit,
  };
}

function createCtx(db: ReturnType<typeof createDbMock>["db"]) {
  return {
    db,
    auth: {
      userId: mockUserId,
      orgId: mockOrganizationId,
    },
    user: {
      primaryEmailAddress: {
        emailAddress: "owner@example.com",
      },
    },
    orgId: mockOrganizationId,
  } as any;
}

describe("webhookEndpointRouter", () => {
  let dbMock: ReturnType<typeof createDbMock>;

  beforeEach(() => {
    dbMock = createDbMock();
    assertSafeWebhookUrlMock.mockClear();
    deliverWebhookMock.mockClear();

    dbMock.endpointFindFirst.mockResolvedValue(createEndpoint());
    dbMock.endpointFindMany.mockResolvedValue([createEndpoint()]);
  });

  describe("create", () => {
    it("creates a webhook endpoint and reveals the secret once", async () => {
      dbMock.state.enabledCount = 0;
      const createdEndpoint = createEndpoint();
      dbMock.insertReturning.mockResolvedValue([createdEndpoint]);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));
      const result = await caller.create({
        formId: mockFormId,
        url: createdEndpoint.url,
      });

      expect(result.secret).toMatch(/^whsec_/);
      expect(result.endpoint.id).toBe(createdEndpoint.id);
      expect(result.endpoint).not.toHaveProperty("encryptedSecret");
      expect(assertSafeWebhookUrlMock).toHaveBeenCalledWith(
        createdEndpoint.url,
      );

      const insertedValues = dbMock.insertValues.mock.calls[0]?.[0];
      expect(insertedValues).toMatchObject({
        formId: mockFormId,
        organizationId: mockOrganizationId,
        url: createdEndpoint.url,
      });
      expect(insertedValues.encryptedSecret).not.toBe(result.secret);
      expect(insertedValues.encryptedSecret).toContain(":");
    });

    it("enforces the max enabled endpoints per form", async () => {
      dbMock.state.enabledCount = 10;

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          formId: mockFormId,
          url: "https://example.com/webhooks/convoform",
        }),
      ).rejects.toThrow("at most 10 enabled webhook endpoints");

      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it("rejects unsafe URLs before storing anything", async () => {
      dbMock.state.enabledCount = 0;
      assertSafeWebhookUrlMock.mockRejectedValueOnce(
        new Error(
          "Webhook URL must not point to a private, loopback or metadata address",
        ),
      );

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          formId: mockFormId,
          url: "https://169.254.169.254/latest/meta-data",
        }),
      ).rejects.toThrow("private, loopback or metadata address");

      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it("rejects forms from another organization", async () => {
      dbMock.formFindFirst.mockResolvedValue(null);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.create({
          formId: mockFormId,
          url: "https://example.com/webhooks/convoform",
        }),
      ).rejects.toThrow("Form not found");
    });
  });

  describe("list", () => {
    it("lists endpoints without the encrypted secret", async () => {
      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.list({ formId: mockFormId });

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty("encryptedSecret");
      expect(dbMock.endpointFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          columns: { encryptedSecret: false },
        }),
      );
    });

    it("rejects forms from another organization", async () => {
      dbMock.formFindFirst.mockResolvedValue(null);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(caller.list({ formId: mockFormId })).rejects.toThrow(
        "Form not found",
      );
      expect(dbMock.endpointFindMany).not.toHaveBeenCalled();
    });
  });

  describe("setEnabled", () => {
    it("clears failures and the auto-disable state when re-enabled", async () => {
      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await caller.setEnabled({ id: "endpoint_1", enabled: true });

      expect(dbMock.updateSet).toHaveBeenCalledWith({
        enabled: true,
        consecutiveFailures: 0,
        disabledAt: null,
        disabledReason: null,
        updatedAt: expect.any(Date),
      });
    });

    it("keeps the failure counter when manually disabled", async () => {
      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await caller.setEnabled({ id: "endpoint_1", enabled: false });

      expect(dbMock.updateSet).toHaveBeenCalledWith({
        enabled: false,
        updatedAt: expect.any(Date),
      });
    });

    it("rejects endpoints from another organization", async () => {
      dbMock.endpointFindFirst.mockResolvedValue(null);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.setEnabled({ id: "endpoint_1", enabled: true }),
      ).rejects.toThrow("Webhook endpoint not found");
    });
  });

  describe("rotateSecret", () => {
    it("stores a fresh encrypted secret", async () => {
      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.rotateSecret({ id: "endpoint_1" });

      expect(result.secret).toMatch(/^whsec_/);
      expect(dbMock.updateSet).toHaveBeenCalledWith({
        encryptedSecret: expect.stringContaining(":"),
        updatedAt: expect.any(Date),
      });
      expect(dbMock.updateSet.mock.calls[0]?.[0]?.encryptedSecret).not.toBe(
        result.secret,
      );
    });
  });

  describe("delete", () => {
    it("deletes an endpoint owned by the organization", async () => {
      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.delete({ id: "endpoint_1" });

      expect(result).toEqual({ success: true });
      expect(dbMock.deleteWhere).toHaveBeenCalled();
    });
  });

  describe("sendTest", () => {
    it("creates a test delivery and dispatches it", async () => {
      dbMock.insertReturning.mockResolvedValue([{ id: "delivery_1" }]);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.sendTest({ id: "endpoint_1" });

      expect(result).toEqual({ deliveryId: "delivery_1" });
      expect(dbMock.insertValues).toHaveBeenCalledWith({
        endpointId: "endpoint_1",
        organizationId: mockOrganizationId,
        conversationId: null,
        eventType: "response.completed",
        isTest: true,
      });
      expect(deliverWebhookMock).toHaveBeenCalledWith(
        "delivery_1",
        expect.objectContaining({ db: dbMock.db }),
      );
    });

    it("refuses to test a disabled endpoint", async () => {
      dbMock.endpointFindFirst.mockResolvedValue(
        createEndpoint({ enabled: false }),
      );

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(caller.sendTest({ id: "endpoint_1" })).rejects.toThrow(
        "Enable the endpoint before sending a test delivery",
      );
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });

  describe("deliveriesForConversation", () => {
    it("returns the form endpoints and the conversation deliveries", async () => {
      dbMock.state.conversationDeliveries = [
        {
          id: "delivery_1",
          endpointId: "endpoint_1",
          endpointUrl: "https://example.com/webhooks/convoform",
          status: "success",
          attempts: 1,
          lastStatusCode: 200,
          lastLatencyMs: 120,
          lastError: null,
          deliveredAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ];

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.deliveriesForConversation({
        conversationId: "conversation_1",
      });

      expect(result.endpoints).toHaveLength(1);
      expect(result.deliveries).toHaveLength(1);
      expect(result.deliveries[0]?.endpointUrl).toBe(
        "https://example.com/webhooks/convoform",
      );
      expect(dbMock.endpointFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          columns: expect.objectContaining({ url: true }),
        }),
      );
    });

    it("rejects conversations from another organization", async () => {
      dbMock.conversationFindFirst.mockResolvedValue(null);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.deliveriesForConversation({ conversationId: "conversation_1" }),
      ).rejects.toThrow("Conversation not found");
      expect(dbMock.endpointFindMany).not.toHaveBeenCalled();
    });
  });

  describe("deliveries", () => {
    it("returns a paginated delivery log", async () => {
      dbMock.state.deliveryItems = [
        {
          id: "delivery_1",
          status: "success",
          attempts: 1,
          isTest: false,
          createdAt: now,
        },
      ];
      dbMock.state.deliveryTotal = 21;

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      const result = await caller.deliveries({
        id: "endpoint_1",
        page: 2,
        pageSize: 10,
      });

      expect(result.page).toBe(2);
      expect(result.total).toBe(21);
      expect(result.totalPages).toBe(3);
      expect(result.items).toHaveLength(1);
      expect(dbMock.limit).toHaveBeenCalledWith(10);
    });

    it("rejects endpoints from another organization", async () => {
      dbMock.endpointFindFirst.mockResolvedValue(null);

      const caller = webhookEndpointRouter.createCaller(createCtx(dbMock.db));

      await expect(
        caller.deliveries({ id: "endpoint_1", page: 1, pageSize: 10 }),
      ).rejects.toThrow("Webhook endpoint not found");
    });
  });
});

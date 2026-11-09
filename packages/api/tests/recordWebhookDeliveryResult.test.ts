import { describe, expect, it, mock } from "bun:test";
import { recordWebhookDeliveryResult } from "../src/actions/webhook/recordWebhookDeliveryResult";

function createUpdateQueue(rows: unknown[][] = []) {
  const setCalls: Array<Record<string, unknown>> = [];
  const update = mock(() => ({
    set: mock((values: Record<string, unknown>) => {
      setCalls.push(values);
      return {
        where: mock(() => {
          const result = rows.shift() ?? [];
          return Object.assign(Promise.resolve(result), {
            returning: mock(() => Promise.resolve(result)),
          });
        }),
      };
    }),
  }));

  return { update, setCalls };
}

function createDbMock({
  delivery,
  updateRows = [],
  owner = { ownerEmail: "owner@example.com", formName: "Contact form" },
}: {
  delivery: any;
  updateRows?: unknown[][];
  owner?: { ownerEmail: string; formName: string } | null;
}) {
  const { update, setCalls } = createUpdateQueue(updateRows);

  return {
    db: {
      query: {
        webhookDelivery: {
          findFirst: mock(() => Promise.resolve(delivery)),
        },
      },
      update,
      select: mock(() => ({
        from: mock(() => ({
          innerJoin: mock(() => ({
            where: mock(() => ({
              limit: mock(() => Promise.resolve(owner ? [owner] : [])),
            })),
          })),
        })),
      })),
    } as any,
    update,
    setCalls,
  };
}

const baseDelivery = {
  id: "delivery_1",
  endpointId: "endpoint_1",
  isTest: false,
  attempts: 0,
  endpoint: {
    id: "endpoint_1",
    formId: "form_1",
    disabledAt: null,
  },
};

describe("recordWebhookDeliveryResult", () => {
  it("marks a successful delivery and resets consecutive failures", async () => {
    const { db, setCalls } = createDbMock({
      delivery: baseDelivery,
      updateRows: [[], []],
    });

    const result = await recordWebhookDeliveryResult(
      {
        deliveryId: "delivery_1",
        success: true,
        statusCode: 200,
        latencyMs: 120,
        attempts: 1,
      },
      { db },
    );

    expect(result).toMatchObject({
      deliveryId: "delivery_1",
      status: "success",
      endpointDisabled: false,
    });
    expect(setCalls[0]).toMatchObject({
      status: "success",
      attempts: 1,
      lastStatusCode: 200,
      lastLatencyMs: 120,
      lastError: null,
    });
    expect(setCalls[1]).toMatchObject({ consecutiveFailures: 0 });
  });

  it("does not count test deliveries towards consecutive failures", async () => {
    const { db, update } = createDbMock({
      delivery: { ...baseDelivery, isTest: true },
      updateRows: [[]],
    });

    const result = await recordWebhookDeliveryResult(
      { deliveryId: "delivery_1", success: false, error: "HTTP 500" },
      { db },
    );

    expect(result.endpointDisabled).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("increments failures but does not disable before 10", async () => {
    const { db } = createDbMock({
      delivery: baseDelivery,
      updateRows: [
        [],
        [{ id: "endpoint_1", consecutiveFailures: 3, disabledAt: null }],
      ],
    });

    const result = await recordWebhookDeliveryResult(
      { deliveryId: "delivery_1", success: false, error: "HTTP 500" },
      { db },
    );

    expect(result.endpointDisabled).toBe(false);
    expect(result.ownerEmail).toBeUndefined();
  });

  it("disables the endpoint at 10 consecutive failures and returns the owner email", async () => {
    const { db, setCalls } = createDbMock({
      delivery: baseDelivery,
      updateRows: [
        [],
        [{ id: "endpoint_1", consecutiveFailures: 10, disabledAt: null }],
        [{ id: "endpoint_1", formId: "form_1" }],
      ],
    });

    const result = await recordWebhookDeliveryResult(
      { deliveryId: "delivery_1", success: false, error: "HTTP 500" },
      { db },
    );

    expect(result).toMatchObject({
      status: "failed",
      endpointDisabled: true,
      ownerEmail: "owner@example.com",
      formName: "Contact form",
    });
    expect(setCalls[2]).toMatchObject({
      enabled: false,
      disabledReason: "Disabled after 10 consecutive failed deliveries",
    });
    expect(setCalls[2]?.disabledAt).toBeInstanceOf(Date);
  });

  it("ignores a duplicate failed result report", async () => {
    const { db, update } = createDbMock({
      delivery: { ...baseDelivery, status: "failed" },
      updateRows: [[]],
    });

    const result = await recordWebhookDeliveryResult(
      { deliveryId: "delivery_1", success: false, error: "HTTP 500" },
      { db },
    );

    expect(result.endpointDisabled).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("does not increment an endpoint that is already disabled", async () => {
    const { db, update } = createDbMock({
      delivery: {
        ...baseDelivery,
        endpoint: { ...baseDelivery.endpoint, disabledAt: new Date() },
      },
      updateRows: [[]],
    });

    const result = await recordWebhookDeliveryResult(
      { deliveryId: "delivery_1", success: false, error: "HTTP 500" },
      { db },
    );

    expect(result.endpointDisabled).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, mock } from "bun:test";
import {
  deliverWebhookWithCloudflare,
  getCloudflareWorkflowConfig,
  isCloudflareWebhookDeliveryConfigured,
} from "../src/actions/webhook/cloudflareWebhookDelivery";
import {
  deliverWebhook,
  resolveWebhookDeliveryEngine,
} from "../src/actions/webhook/deliverWebhook";
const config = {
  accountId: "account_1",
  apiToken: "token_1",
  workflowName: "convoform-webhook-delivery",
};

function createDbMock() {
  const where = mock(() => Promise.resolve());
  const set = mock(() => ({ where }));
  const update = mock(() => ({ set }));

  return {
    db: { update } as any,
    update,
    set,
    where,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("cloudflare webhook delivery configuration", () => {
  it("requires all three environment variables", () => {
    expect(getCloudflareWorkflowConfig({})).toBeNull();
    expect(
      getCloudflareWorkflowConfig({
        CF_ACCOUNT_ID: "account_1",
        CF_API_TOKEN: "token_1",
      }),
    ).toBeNull();
    expect(
      getCloudflareWorkflowConfig({
        CF_ACCOUNT_ID: "account_1",
        CF_API_TOKEN: "token_1",
        CF_WEBHOOK_WORKFLOW_NAME: " ",
      }),
    ).toBeNull();
  });

  it("returns the trimmed configuration", () => {
    expect(
      getCloudflareWorkflowConfig({
        CF_ACCOUNT_ID: " account_1 ",
        CF_API_TOKEN: " token_1 ",
        CF_WEBHOOK_WORKFLOW_NAME: " convoform-webhook-delivery ",
      }),
    ).toEqual(config);
  });

  it("detects whether the engine is configured", () => {
    expect(isCloudflareWebhookDeliveryConfigured({})).toBe(false);
    expect(
      isCloudflareWebhookDeliveryConfigured({
        CF_ACCOUNT_ID: "account_1",
        CF_API_TOKEN: "token_1",
        CF_WEBHOOK_WORKFLOW_NAME: "convoform-webhook-delivery",
      }),
    ).toBe(true);
  });

  it("resolves cloudflare only when fully configured", () => {
    expect(resolveWebhookDeliveryEngine({})).toBe("direct");
    expect(
      resolveWebhookDeliveryEngine({
        CF_ACCOUNT_ID: "account_1",
        CF_API_TOKEN: "token_1",
        CF_WEBHOOK_WORKFLOW_NAME: "convoform-webhook-delivery",
      }),
    ).toBe("cloudflare");
  });
});

describe("cloudflare webhook delivery adapter", () => {
  it("routes to the Cloudflare adapter when selected", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.resolve(jsonResponse({ success: true, result: { id: "d" } })),
    );

    await deliverWebhook(
      "delivery_1",
      { db: dbMock.db },
      {
        engine: "cloudflare",
        cloudflare: {
          config,
          fetchImpl: fetchImpl as unknown as typeof fetch,
          reportResult,
        },
      },
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(reportResult).not.toHaveBeenCalled();
  });

  it("creates an idempotent workflow instance and marks the delivery as delivering", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.resolve(
        jsonResponse({ success: true, result: { id: "delivery_1" } }),
      ),
    );

    await deliverWebhookWithCloudflare(
      "delivery_1",
      { db: dbMock.db },
      {
        config,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        reportResult,
      },
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.cloudflare.com/client/v4/accounts/account_1/workflows/convoform-webhook-delivery/instances",
    );
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      authorization: "Bearer token_1",
      "content-type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      instance_id: "delivery_1",
      params: { deliveryId: "delivery_1" },
    });

    expect(dbMock.update).toHaveBeenCalledTimes(2);
    expect(dbMock.set).toHaveBeenNthCalledWith(1, {
      status: "delivering",
      updatedAt: expect.any(Date),
    });
    expect(dbMock.set).toHaveBeenNthCalledWith(2, {
      workflowInstanceId: "delivery_1",
      updatedAt: expect.any(Date),
    });
    expect(reportResult).not.toHaveBeenCalled();
  });

  it("treats an already-existing instance as success", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.resolve(
        jsonResponse(
          {
            success: false,
            errors: [
              {
                code: 10405,
                message: "An instance with this ID already exists",
              },
            ],
          },
          409,
        ),
      ),
    );

    await deliverWebhookWithCloudflare(
      "delivery_1",
      { db: dbMock.db },
      {
        config,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        reportResult,
      },
    );

    expect(reportResult).not.toHaveBeenCalled();
    expect(dbMock.set).toHaveBeenCalledWith(
      expect.objectContaining({ workflowInstanceId: "delivery_1" }),
    );
  });

  it("records a failed delivery when Cloudflare rejects the request", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.resolve(
        jsonResponse(
          {
            success: false,
            errors: [{ code: 10000, message: "Authentication error" }],
          },
          403,
        ),
      ),
    );

    await deliverWebhookWithCloudflare(
      "delivery_1",
      { db: dbMock.db },
      {
        config,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        reportResult,
      },
    );

    expect(dbMock.update).toHaveBeenCalledTimes(1);
    expect(reportResult).toHaveBeenCalledWith({
      deliveryId: "delivery_1",
      success: false,
      statusCode: null,
      latencyMs: null,
      attempts: 0,
      error: expect.stringContaining("Authentication error"),
    });
  });

  it("records a failed delivery when Cloudflare is unreachable", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.reject(new Error("connect ECONNREFUSED")),
    );

    await deliverWebhookWithCloudflare(
      "delivery_1",
      { db: dbMock.db },
      {
        config,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        reportResult,
      },
    );

    expect(reportResult).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryId: "delivery_1",
        success: false,
        attempts: 0,
        error: expect.stringContaining("ECONNREFUSED"),
      }),
    );
  });

  it("records a failure when the engine is not configured", async () => {
    const dbMock = createDbMock();
    const reportResult = mock(() => Promise.resolve());

    await deliverWebhookWithCloudflare(
      "delivery_1",
      { db: dbMock.db },
      { config: null, reportResult },
    );

    expect(reportResult).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryId: "delivery_1",
        success: false,
        attempts: 0,
        error: "Cloudflare Workflow delivery is not configured",
      }),
    );
  });

  it("does not fail the dispatch when the delivery status update fails", async () => {
    const dbMock = {
      db: {
        update: mock(() => {
          throw new Error("database unavailable");
        }),
      } as any,
    };
    const reportResult = mock(() => Promise.resolve());
    const fetchImpl = mock(() =>
      Promise.resolve(jsonResponse({ success: true, result: { id: "d" } })),
    );
    const consoleError = mock(() => {
      // Silence the expected status-update error.
    });
    const originalConsoleError = console.error;
    console.error = consoleError as any;

    try {
      await deliverWebhookWithCloudflare(
        "delivery_1",
        { db: dbMock.db },
        {
          config,
          fetchImpl: fetchImpl as unknown as typeof fetch,
          reportResult,
        },
      );
    } finally {
      console.error = originalConsoleError;
    }

    // A status-update failure must not fail the dispatch: the Workflow exists.
    expect(reportResult).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });
});

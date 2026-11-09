import { describe, expect, it } from "bun:test";
import {
  WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
  createWebhookSignatureHeaders,
  generateWebhookSecret,
  verifyWebhookSignature,
} from "./signature";

const payload = JSON.stringify({ type: "response.completed", data: { id: 1 } });
const timestamp = 1_767_225_600;

describe("webhook signatures", () => {
  it("generates a whsec_ prefixed secret", () => {
    const secret = generateWebhookSecret();
    expect(secret.startsWith("whsec_")).toBe(true);
    expect(secret.length).toBeGreaterThan(20);
    expect(generateWebhookSecret()).not.toBe(secret);
  });

  it("creates Svix-compatible headers", async () => {
    const secret = generateWebhookSecret();
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    expect(headers["webhook-id"]).toBe("msg_delivery_1");
    expect(headers["webhook-timestamp"]).toBe(String(timestamp));
    expect(headers["webhook-signature"].startsWith("v1,")).toBe(true);
  });

  it("verifies a signature created with the same secret and body", async () => {
    const secret = generateWebhookSecret();
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret,
        payload,
        headers,
        nowSeconds: timestamp,
      }),
    ).resolves.toBe(true);
  });

  it("accepts multiple space-separated signatures", async () => {
    const secret = generateWebhookSecret();
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret,
        payload,
        headers: {
          ...headers,
          "webhook-signature": `v1,AAAA ${headers["webhook-signature"]}`,
        },
        nowSeconds: timestamp,
      }),
    ).resolves.toBe(true);
  });

  it("rejects a tampered payload", async () => {
    const secret = generateWebhookSecret();
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret,
        payload: `${payload} `,
        headers,
        nowSeconds: timestamp,
      }),
    ).resolves.toBe(false);
  });

  it("rejects a different secret", async () => {
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret: generateWebhookSecret(),
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret: generateWebhookSecret(),
        payload,
        headers,
        nowSeconds: timestamp,
      }),
    ).resolves.toBe(false);
  });

  it("rejects a timestamp outside the tolerance", async () => {
    const secret = generateWebhookSecret();
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret,
        payload,
        headers,
        nowSeconds: timestamp + WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS + 1,
      }),
    ).resolves.toBe(false);
  });

  it("rejects missing headers", async () => {
    await expect(
      verifyWebhookSignature({
        secret: generateWebhookSecret(),
        payload,
        headers: {},
      }),
    ).resolves.toBe(false);
  });

  it("also supports non-prefixed secrets", async () => {
    const secret = "plain-shared-secret";
    const headers = await createWebhookSignatureHeaders({
      deliveryId: "delivery_1",
      secret,
      payload,
      timestamp,
    });

    await expect(
      verifyWebhookSignature({
        secret,
        payload,
        headers,
        nowSeconds: timestamp,
      }),
    ).resolves.toBe(true);
  });
});

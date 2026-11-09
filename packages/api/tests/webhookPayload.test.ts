import { describe, expect, it } from "bun:test";
import {
  MAX_WEBHOOK_PAYLOAD_BYTES,
  buildResponseCompletedPayload,
  buildTestWebhookPayload,
  payloadByteLength,
} from "../src/actions/webhook/buildWebhookPayload";

const conversation = {
  id: "conversation_1",
  formId: "form_1",
  formFieldResponses: [
    { fieldName: "Name", fieldValue: "Ada" },
    { fieldName: "Email", fieldValue: "ada@example.com" },
  ],
  metaData: {
    submittedAt: new Date("2026-01-01T10:00:00.000Z"),
  },
  finishedAt: new Date("2026-01-01T10:00:00.000Z"),
  createdAt: new Date("2026-01-01T09:55:00.000Z"),
  channelType: null,
};

describe("webhook payload", () => {
  it("builds the response.completed payload from stored data", () => {
    const payload = buildResponseCompletedPayload({
      conversation,
      formName: "Contact form",
      timestamp: new Date("2026-01-01T10:00:01.000Z"),
    });

    expect(payload).toEqual({
      type: "response.completed",
      version: "1",
      timestamp: "2026-01-01T10:00:01.000Z",
      data: {
        responseId: "conversation_1",
        formId: "form_1",
        formName: "Contact form",
        submittedAt: "2026-01-01T10:00:00.000Z",
        fields: [
          { fieldName: "Name", fieldValue: "Ada" },
          { fieldName: "Email", fieldValue: "ada@example.com" },
        ],
        metadata: { source: "web" },
      },
    });
  });

  it("uses the channel as the payload source when present", () => {
    const payload = buildResponseCompletedPayload({
      conversation: { ...conversation, channelType: "telegram" },
      formName: "Contact form",
    });

    expect(payload.data.metadata.source).toBe("telegram");
  });

  it("builds a sample payload for test deliveries", () => {
    const payload = buildTestWebhookPayload({
      deliveryId: "delivery_1",
      formId: "form_1",
      timestamp: new Date("2026-01-01T10:00:00.000Z"),
    });

    expect(payload.data.responseId).toBe("test_delivery_1");
    expect(payload.data.metadata.source).toBe("test");
  });

  it("truncates field values so the payload stays under 64 KB", () => {
    const payload = buildResponseCompletedPayload({
      conversation: {
        ...conversation,
        formFieldResponses: [
          {
            fieldName: "Huge",
            fieldValue: "x".repeat(100_000),
          },
        ],
      },
      formName: "Contact form",
    });

    expect(payload.data.truncated).toBe(true);
    expect(payload.data.fields[0]?.fieldValue.length).toBeLessThan(65_536);
    expect(payloadByteLength(payload)).toBeLessThanOrEqual(
      MAX_WEBHOOK_PAYLOAD_BYTES,
    );
  });

  it("keeps a normal payload unchanged", () => {
    const payload = buildResponseCompletedPayload({
      conversation,
      formName: "Contact form",
    });

    expect(payload.data.truncated).toBeUndefined();
  });
});

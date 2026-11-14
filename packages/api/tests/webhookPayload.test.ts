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

  it("includes visible response labels and drops low-confidence ones", () => {
    const timestamp = new Date("2026-01-01T10:00:00.000Z");
    const payload = buildResponseCompletedPayload({
      conversation: {
        ...conversation,
        metaData: {
          submittedAt: new Date("2026-01-01T10:00:00.000Z"),
          labels: {
            tone: { value: "casual", score: 0.9, provider: "clef", timestamp },
            sentiment: {
              value: "positive",
              score: 0.5,
              provider: "clef",
              timestamp,
            },
            temperature: {
              value: "Hot",
              score: 0.8,
              provider: "clef",
              timestamp,
            },
            categories: [
              {
                categoryId: "country",
                categoryName: "Country",
                value: "UK",
                score: 0.7,
                provider: "clef",
                timestamp,
              },
            ],
          },
        },
      },
      formName: "Contact form",
    });

    expect(payload.data.labels).toEqual({
      tone: "casual",
      leadTemperature: "Hot",
      categories: {
        country: { name: "Country", value: "UK" },
      },
    });
  });

  it("falls back to legacy tone and sentiment labels", () => {
    const payload = buildResponseCompletedPayload({
      conversation: {
        ...conversation,
        metaData: {
          submittedAt: new Date("2026-01-01T10:00:00.000Z"),
          insights: {
            tldr: "Old conversation",
            externalQueries: [],
            userTone: "formal",
            userSentiment: "mixed",
            generatedAt: new Date("2025-12-01T10:00:00.000Z"),
          },
        },
      },
      formName: "Contact form",
    });

    expect(payload.data.labels).toEqual({
      tone: "formal",
      sentiment: "mixed",
    });
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

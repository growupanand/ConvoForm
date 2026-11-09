import { describe, expect, it } from "bun:test";
import {
  type ConversationJourneyInput,
  type JourneyWebhookDelivery,
  type JourneyWebhookEndpoint,
  MAX_WEBHOOK_ATTEMPTS,
  buildConversationJourney,
  formatWebhookAttempt,
  resolveAbandonedField,
  truncateWebhookUrl,
} from "./conversationJourney.utils";

type JourneyConversation = ConversationJourneyInput["conversation"];

function createConversation(
  overrides: Partial<JourneyConversation> = {},
): JourneyConversation {
  const base = {
    createdAt: new Date("2026-11-09T09:00:00.000Z"),
    updatedAt: new Date("2026-11-09T09:05:00.000Z"),
    finishedAt: new Date("2026-11-09T09:05:00.000Z"),
    isInProgress: false,
    currentFieldId: null,
    channelType: null,
    formFieldResponses: [
      {
        id: "field_1",
        fieldName: "Full name",
        fieldValue: "Asha Patel",
      },
      {
        id: "field_2",
        fieldName: "Budget",
        fieldValue: "20 lakh",
      },
      {
        id: "field_3",
        fieldName: "Intake",
        fieldValue: "Fall 2027",
      },
    ],
    metaData: {
      userAgent: {
        browser: {
          name: "Chrome",
        },
      },
      insights: {
        tldr: "A student asked about the fall intake.",
        externalQueries: [],
        userTone: "neutral",
        userSentiment: "positive",
        generatedAt: new Date("2026-11-09T09:05:30.000Z"),
        completionStatus: "completed",
      },
    },
  };

  return { ...base, ...overrides } as unknown as JourneyConversation;
}

const endpoint: JourneyWebhookEndpoint = {
  id: "endpoint_1",
  url: "https://hooks.example.com/convoform/responses",
  enabled: true,
  disabledAt: null,
};

function createDelivery(
  overrides: Partial<JourneyWebhookDelivery> = {},
): JourneyWebhookDelivery {
  return {
    id: "delivery_1",
    endpointId: endpoint.id,
    endpointUrl: endpoint.url,
    status: "success",
    attempts: 1,
    lastStatusCode: 200,
    lastLatencyMs: 120,
    lastError: null,
    deliveredAt: new Date("2026-11-09T09:06:00.000Z"),
    createdAt: new Date("2026-11-09T09:05:00.000Z"),
    updatedAt: new Date("2026-11-09T09:06:00.000Z"),
    ...overrides,
  };
}

describe("buildConversationJourney", () => {
  it("maps a completed conversation with insights and a delivered webhook", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [createDelivery()],
    });

    expect(journey.status).toBe("finished");
    expect(journey.nodes.map((node) => node.id)).toEqual([
      "started",
      "fields",
      "outcome",
      "insights",
      "webhook",
    ]);

    expect(journey.nodes[0]?.subtitle).toBe("Web · Chrome");
    expect(journey.nodes[1]?.subtitle).toBe("3 of 3");
    expect(journey.nodes[2]?.title).toBe("Finished");
    expect(journey.nodes[2]?.timestamp).toEqual(
      new Date("2026-11-09T09:05:00.000Z"),
    );
    expect(journey.nodes[3]?.title).toBe("Insights generated");
    expect(journey.nodes[3]?.state).toBe("complete");

    expect(journey.nodes[4]?.subtitle).toBe("Delivered");
    expect(journey.nodes[4]?.state).toBe("complete");
    expect(journey.nodes[4]?.timestamp).toEqual(
      new Date("2026-11-09T09:06:00.000Z"),
    );
    expect(journey.nodes[4]?.webhook?.summary).toBe("delivered");
    expect(journey.nodes[4]?.webhook?.deliveries).toHaveLength(1);

    // Owner email is not persisted yet, so it must not appear as a node.
    expect(
      journey.nodes.some((node) => node.title.toLowerCase().includes("email")),
    ).toBe(false);
  });

  it("marks an abandoned conversation at the current field and skips later nodes", () => {
    const journey = buildConversationJourney({
      conversation: createConversation({
        finishedAt: null,
        isInProgress: false,
        currentFieldId: "field_2",
        formFieldResponses: [
          { id: "field_1", fieldName: "Full name", fieldValue: "Asha Patel" },
          { id: "field_2", fieldName: "Budget", fieldValue: null },
          { id: "field_3", fieldName: "Intake", fieldValue: null },
        ],
        metaData: {},
      }),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [],
    });

    expect(journey.status).toBe("abandoned");
    expect(journey.abandonedAtField).toBe("Budget");
    expect(journey.nodes[1]?.subtitle).toBe("1 of 3");
    expect(journey.nodes[2]?.title).toBe("Abandoned at Budget");
    expect(journey.nodes[2]?.state).toBe("warning");
    expect(journey.nodes[3]?.subtitle).toBe("Skipped");
    expect(journey.nodes[3]?.state).toBe("skipped");
    expect(journey.nodes[4]?.subtitle).toBe("Not sent");
    expect(journey.nodes[4]?.state).toBe("skipped");
    expect(journey.nodes[4]?.webhook).toBeUndefined();
  });

  it("falls back to the first unanswered field when currentFieldId is missing", () => {
    const conversation = createConversation({
      finishedAt: null,
      isInProgress: false,
      currentFieldId: null,
      formFieldResponses: [
        { id: "field_1", fieldName: "Full name", fieldValue: "Asha Patel" },
        { id: "field_2", fieldName: "Budget", fieldValue: null },
        { id: "field_3", fieldName: "Intake", fieldValue: null },
      ],
    });

    expect(resolveAbandonedField(conversation)).toBe("Budget");
    expect(buildConversationJourney({ conversation }).nodes[2]?.title).toBe(
      "Abandoned at Budget",
    );
  });

  it("shows an in-progress conversation without a finished node", () => {
    const journey = buildConversationJourney({
      conversation: createConversation({
        finishedAt: null,
        isInProgress: true,
        currentFieldId: "field_2",
        formFieldResponses: [
          { id: "field_1", fieldName: "Full name", fieldValue: "Asha Patel" },
          { id: "field_2", fieldName: "Budget", fieldValue: null },
          { id: "field_3", fieldName: "Intake", fieldValue: null },
        ],
        metaData: {},
      }),
      webhookEndpoints: [endpoint],
    });

    expect(journey.status).toBe("inProgress");
    expect(journey.nodes[1]?.subtitle).toBe("1 of 3");
    expect(journey.nodes[1]?.state).toBe("current");
    expect(journey.nodes[2]?.title).toBe("In progress");
    expect(journey.nodes[2]?.subtitle).toBe("Waiting on Budget");
    expect(journey.nodes[2]?.state).toBe("current");
    expect(journey.nodes[3]?.state).toBe("pending");
    expect(journey.nodes[4]?.subtitle).toBe("Pending");
    expect(journey.nodes[4]?.state).toBe("pending");
  });

  it("shows owner previews as skipped instead of a failed delivery", () => {
    const journey = buildConversationJourney({
      conversation: createConversation({
        metaData: {
          isOwnerPreview: true,
          insights: {
            tldr: "Owner preview.",
            externalQueries: [],
            userTone: "neutral",
            userSentiment: "neutral",
            generatedAt: new Date("2026-11-09T09:05:30.000Z"),
            completionStatus: "completed",
          },
        },
      }),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [],
    });

    expect(journey.nodes[4]?.subtitle).toBe("Owner preview · webhooks skipped");
    expect(journey.nodes[4]?.state).toBe("skipped");
    expect(journey.nodes[4]?.webhook).toBeUndefined();
  });

  it("labels a delivering webhook as retrying with the next attempt", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [
        createDelivery({
          status: "delivering",
          attempts: 2,
          deliveredAt: null,
          lastStatusCode: 503,
        }),
      ],
    });

    expect(journey.nodes[4]?.subtitle).toBe(
      `Retrying · attempt 3 of ${MAX_WEBHOOK_ATTEMPTS}`,
    );
    expect(journey.nodes[4]?.state).toBe("current");
    expect(journey.nodes[4]?.webhook?.summary).toBe("retrying");
  });

  it("labels a pending webhook as pending", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [
        createDelivery({
          status: "pending",
          attempts: 0,
          deliveredAt: null,
          lastStatusCode: null,
          lastLatencyMs: null,
        }),
      ],
    });

    expect(journey.nodes[4]?.subtitle).toBe("Pending");
    expect(journey.nodes[4]?.state).toBe("pending");
    expect(journey.nodes[4]?.webhook?.summary).toBe("pending");
  });

  it("labels a failed webhook and keeps the final attempt time", () => {
    const failedAt = new Date("2026-11-09T11:10:00.000Z");
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [
        createDelivery({
          status: "failed",
          attempts: MAX_WEBHOOK_ATTEMPTS,
          deliveredAt: null,
          lastStatusCode: 500,
          lastError: "HTTP 500 Internal Server Error",
          updatedAt: failedAt,
        }),
      ],
    });

    expect(journey.nodes[4]?.subtitle).toBe("Failed");
    expect(journey.nodes[4]?.state).toBe("error");
    expect(journey.nodes[4]?.timestamp).toEqual(failedAt);
    expect(journey.nodes[4]?.webhook?.summary).toBe("failed");
    expect(journey.nodes[4]?.webhook?.deliveries[0]?.lastError).toBe(
      "HTTP 500 Internal Server Error",
    );
  });

  it("counts mixed endpoint outcomes and names failed endpoints", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [
        endpoint,
        { ...endpoint, id: "endpoint_2", url: "https://hooks.example.com/b" },
      ],
      webhookDeliveries: [
        createDelivery(),
        createDelivery({
          id: "delivery_2",
          endpointId: "endpoint_2",
          endpointUrl: "https://hooks.example.com/b",
          status: "failed",
          attempts: MAX_WEBHOOK_ATTEMPTS,
          deliveredAt: null,
          lastStatusCode: 500,
        }),
      ],
    });

    expect(journey.nodes[4]?.subtitle).toBe("Failed · 1 of 2 endpoints");
    expect(journey.nodes[4]?.state).toBe("error");
  });

  it("omits the webhook node when there are no endpoints and no deliveries", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
    });

    expect(journey.nodes.map((node) => node.id)).toEqual([
      "started",
      "fields",
      "outcome",
      "insights",
    ]);
  });

  it("mutes the insights node when no insights were generated", () => {
    const journey = buildConversationJourney({
      conversation: createConversation({ metaData: {} }),
    });

    expect(journey.nodes[3]?.title).toBe("Insights generated");
    expect(journey.nodes[3]?.subtitle).toBe("Not generated");
    expect(journey.nodes[3]?.state).toBe("skipped");
    expect(journey.nodes[3]?.timestamp).toBeUndefined();
  });

  it("flags a finished conversation with endpoints but no queued delivery", () => {
    const journey = buildConversationJourney({
      conversation: createConversation(),
      webhookEndpoints: [endpoint],
      webhookDeliveries: [],
    });

    expect(journey.nodes[4]?.subtitle).toBe("Not queued");
    expect(journey.nodes[4]?.state).toBe("warning");
    expect(journey.nodes[4]?.webhook?.summary).toBe("notQueued");
  });
});

describe("webhook formatting helpers", () => {
  it("clamps attempts into the 1 of 8 to 8 of 8 range", () => {
    expect(formatWebhookAttempt(0)).toBe(
      `Attempt 1 of ${MAX_WEBHOOK_ATTEMPTS}`,
    );
    expect(formatWebhookAttempt(3)).toBe(
      `Attempt 3 of ${MAX_WEBHOOK_ATTEMPTS}`,
    );
    expect(formatWebhookAttempt(12)).toBe(
      `Attempt ${MAX_WEBHOOK_ATTEMPTS} of ${MAX_WEBHOOK_ATTEMPTS}`,
    );
  });

  it("drops the protocol and truncates long webhook urls", () => {
    expect(truncateWebhookUrl("https://hooks.example.com/a")).toBe(
      "hooks.example.com/a",
    );
    expect(
      truncateWebhookUrl(
        "https://hooks.example.com/a-very-long-path-that-keeps-going-and-going",
        24,
      ),
    ).toBe("hooks.example.com/a-ver…");
  });
});

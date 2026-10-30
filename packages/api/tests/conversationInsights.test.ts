import { describe, expect, it } from "bun:test";

import {
  resolveWebsocketInsightsDecision,
  shouldGenerateAbandonedInsights,
  shouldSkipInsightsGeneration,
} from "../src/actions/conversation/conversationInsightsDecision";

describe("conversation insights helpers", () => {
  const finishedAt = new Date("2026-10-30T17:19:19.621Z");

  it("skips websocket insights when completion is still pending", () => {
    const decision = resolveWebsocketInsightsDecision(
      {
        id: "conv_1",
        formId: "form_1",
        organizationId: "org_1",
        finishedAt,
        transcript: [{ role: "user", content: "done" }],
        formFieldResponses: [{ fieldName: "name", fieldValue: "Ada" } as any],
        metaData: {},
      },
      finishedAt.getTime() + 5_000,
    );

    expect(decision).toEqual({
      action: "skip",
      reason: "primary_completion_pending",
    });
  });

  it("uses fallback generation when finished insights are still missing", () => {
    const decision = resolveWebsocketInsightsDecision(
      {
        id: "conv_1",
        formId: "form_1",
        organizationId: "org_1",
        finishedAt,
        transcript: [{ role: "user", content: "done" }],
        formFieldResponses: [{ fieldName: "name", fieldValue: "Ada" } as any],
        metaData: {},
      },
      finishedAt.getTime() + 60_000,
    );

    expect(decision).toEqual({
      action: "generate",
      trigger: "fallback",
      isPartial: false,
      completionStatus: "completed",
    });
  });

  it("skips abandoned conversations without answers", () => {
    expect(
      shouldGenerateAbandonedInsights({
        transcript: [{ role: "assistant", content: "Hello" }],
        formFieldResponses: [{ fieldName: "name", fieldValue: null } as any],
      }),
    ).toBe(false);

    const decision = resolveWebsocketInsightsDecision({
      id: "conv_1",
      formId: "form_1",
      organizationId: "org_1",
      finishedAt: null,
      transcript: [{ role: "assistant", content: "Hello" }],
      formFieldResponses: [{ fieldName: "name", fieldValue: null } as any],
      metaData: {},
    });

    expect(decision).toEqual({
      action: "skip",
      reason: "abandoned_without_answers",
    });
  });

  it("allows completed regeneration when insights predate finishedAt", () => {
    expect(
      shouldSkipInsightsGeneration({
        metaData: {
          insights: {
            generatedAt: new Date("2026-10-30T17:19:18.000Z"),
            tldr: "stale",
            externalQueries: [],
            userTone: "neutral",
            userSentiment: "neutral",
          },
        },
        finishedAt,
        trigger: "completed",
      }),
    ).toBeNull();
  });

  it("skips when insights were generated after completion", () => {
    expect(
      shouldSkipInsightsGeneration({
        metaData: {
          insights: {
            generatedAt: new Date("2026-10-30T17:19:22.000Z"),
            tldr: "current",
            externalQueries: [],
            userTone: "neutral",
            userSentiment: "neutral",
          },
        },
        finishedAt,
        trigger: "fallback",
      }),
    ).toBe("insights_already_current");
  });
});

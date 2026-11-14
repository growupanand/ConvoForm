import { describe, expect, it } from "bun:test";

import { mergeConversationMetaDataForPatch } from "../src/actions/conversation/mergeConversationMetaDataForPatch";

describe("mergeConversationMetaDataForPatch", () => {
  const existingInsights = {
    tldr: "saved",
    externalQueries: [],
    userTone: "neutral" as const,
    userSentiment: "neutral" as const,
    generatedAt: new Date("2026-10-30T17:19:21.000Z"),
  };

  it("keeps existing insights when the client patch omits them", () => {
    const merged = mergeConversationMetaDataForPatch(
      { isOwnerPreview: false },
      { insights: existingInsights },
    );

    expect(merged.insights).toEqual(existingInsights);
    expect(merged.isOwnerPreview).toBe(false);
  });

  it("uses incoming insights when the client sends them", () => {
    const incomingInsights = {
      ...existingInsights,
      tldr: "from client",
    };

    const merged = mergeConversationMetaDataForPatch(
      { insights: incomingInsights },
      { insights: existingInsights },
    );

    expect(merged.insights?.tldr).toBe("from client");
  });

  it("keeps server-written labels when the client patch omits them", () => {
    const labels = {
      tone: {
        value: "casual",
        score: 0.9,
        provider: "cloudflare-clef",
        timestamp: new Date("2026-10-30T17:19:22.000Z"),
      },
    };

    const merged = mergeConversationMetaDataForPatch(
      { isOwnerPreview: false },
      { insights: existingInsights, labels },
    );

    expect(merged.labels).toEqual(labels);
    expect(merged.insights).toEqual(existingInsights);
  });
});

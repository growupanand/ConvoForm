import { describe, expect, it } from "bun:test";
import { getVisibleConversationLabels } from "@convoform/db/src/schema";

const generatedAt = new Date("2026-11-01T10:00:00.000Z");

describe("getVisibleConversationLabels", () => {
  it("shows labels at or above the score threshold and hides the rest", () => {
    const labels = getVisibleConversationLabels({
      labels: {
        tone: {
          value: "casual",
          score: 0.8,
          provider: "clef",
          timestamp: generatedAt,
        },
        sentiment: {
          value: "negative",
          score: 0.59,
          provider: "clef",
          timestamp: generatedAt,
        },
        temperature: {
          value: "Hot",
          score: 0.6,
          provider: "clef",
          timestamp: generatedAt,
        },
        categories: [
          {
            categoryId: "country",
            categoryName: "Country",
            value: "UK",
            score: 0.7,
            provider: "clef",
            timestamp: generatedAt,
          },
          {
            categoryId: "budget",
            categoryName: "Budget",
            value: "₹20–40L",
            score: 0.3,
            provider: "clef",
            timestamp: generatedAt,
          },
        ],
      },
    });

    expect(labels.tone?.value).toBe("casual");
    expect(labels.sentiment).toBeUndefined();
    expect(labels.temperature?.value).toBe("Hot");
    expect(labels.categories.map((label) => label.value)).toEqual(["UK"]);
  });

  it("falls back to legacy tone and sentiment from insights", () => {
    const labels = getVisibleConversationLabels({
      insights: {
        userTone: "formal",
        userSentiment: "positive",
        generatedAt,
      },
    });

    expect(labels.tone).toMatchObject({
      value: "formal",
      score: 1,
      provider: "llm",
    });
    expect(labels.sentiment?.value).toBe("positive");
    expect(labels.temperature).toBeUndefined();
    expect(labels.categories).toEqual([]);
  });

  it("prefers new labels over legacy insights values", () => {
    const labels = getVisibleConversationLabels({
      labels: {
        tone: {
          value: "casual",
          score: 0.9,
          provider: "clef",
          timestamp: generatedAt,
        },
      },
      insights: {
        userTone: "formal",
        userSentiment: "negative",
        generatedAt,
      },
    });

    expect(labels.tone?.value).toBe("casual");
    expect(labels.sentiment?.value).toBe("negative");
  });

  it("shows nothing for an empty metadata object", () => {
    const labels = getVisibleConversationLabels({});

    expect(labels).toEqual({ categories: [] });
  });
});

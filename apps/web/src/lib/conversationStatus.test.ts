import { describe, expect, it } from "bun:test";
import {
  ACTIVE_CONVERSATION_WINDOW_MS,
  isConversationInProgress,
} from "./conversationStatus";

const now = new Date("2026-11-09T12:00:00.000Z").getTime();

function createConversation(
  overrides: Partial<{
    finishedAt: Date | null;
    isInProgress: boolean;
    updatedAt: Date;
    channelType: string | null;
  }> = {},
) {
  return {
    finishedAt: null,
    isInProgress: false,
    updatedAt: new Date(now - 60_000),
    channelType: null,
    ...overrides,
  };
}

describe("isConversationInProgress", () => {
  it("treats a recently updated channel conversation as in progress", () => {
    expect(
      isConversationInProgress(
        createConversation({ channelType: "whatsapp" }),
        now,
      ),
    ).toBe(true);
  });

  it("treats a web conversation without isInProgress as abandoned even when recently updated", () => {
    expect(
      isConversationInProgress(createConversation({ channelType: "web" }), now),
    ).toBe(false);
    expect(isConversationInProgress(createConversation(), now)).toBe(false);
  });

  it("treats a stale channel conversation as abandoned", () => {
    expect(
      isConversationInProgress(
        createConversation({
          channelType: "whatsapp",
          updatedAt: new Date(now - ACTIVE_CONVERSATION_WINDOW_MS - 1),
        }),
        now,
      ),
    ).toBe(false);
  });

  it("respects the explicit in-progress flag even when the row is old", () => {
    expect(
      isConversationInProgress(
        createConversation({
          isInProgress: true,
          channelType: "whatsapp",
          updatedAt: new Date(now - ACTIVE_CONVERSATION_WINDOW_MS - 1),
        }),
        now,
      ),
    ).toBe(true);
  });

  it("never treats a finished conversation as in progress", () => {
    expect(
      isConversationInProgress(
        createConversation({
          finishedAt: new Date(now),
          isInProgress: true,
          channelType: "whatsapp",
        }),
        now,
      ),
    ).toBe(false);
  });
});

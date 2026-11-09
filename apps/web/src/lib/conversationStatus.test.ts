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
  }> = {},
) {
  return {
    finishedAt: null,
    isInProgress: false,
    updatedAt: new Date(now - 60_000),
    ...overrides,
  };
}

describe("isConversationInProgress", () => {
  it("treats a recently updated channel conversation as in progress", () => {
    expect(isConversationInProgress(createConversation(), now)).toBe(true);
  });

  it("treats a stale web conversation as abandoned", () => {
    expect(
      isConversationInProgress(
        createConversation({
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
        }),
        now,
      ),
    ).toBe(false);
  });
});

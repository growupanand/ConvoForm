import { apiClient } from "./apiClient";

export const conversationStopped = (conversationId: string) =>
  apiClient("POST", {
    eventName: "conversation:stopped",
    eventData: {
      conversationId,
    },
  });

export const conversationStarted = (conversationId: string) =>
  apiClient("POST", {
    eventName: "conversation:started",
    eventData: {
      conversationId,
    },
  });

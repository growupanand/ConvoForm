import { apiClient } from "./apiClient";

export const conversationStopped = (
  conversationId: string,
  apiDomainUrl: string,
) =>
  apiClient(
    "POST",
    {
      eventName: "conversation:stopped",
      eventData: {
        conversationId,
      },
    },
    apiDomainUrl,
  );

export const conversationStarted = (
  conversationId: string,
  apiDomainUrl: string,
) =>
  apiClient(
    "POST",
    {
      eventName: "conversation:started",
      eventData: {
        conversationId,
      },
    },
    apiDomainUrl,
  );

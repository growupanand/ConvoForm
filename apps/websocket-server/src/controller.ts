import { apiClient } from "./apiClient";

export const conversationStopped = (
  conversationId: string,
  apiDomainUrl: string,
  internalSecret: string,
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
    internalSecret,
  );

export const conversationStarted = (
  conversationId: string,
  apiDomainUrl: string,
  internalSecret: string,
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
    internalSecret,
  );

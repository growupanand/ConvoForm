export const getAPIDomainUrl = (): string => {
  const fallbackUrl =
    process.env.NEXT_PUBLIC_PACKAGE_ENV === "production"
      ? "wss://realtime.convoform.com"
      : "ws://localhost:8787";
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? fallbackUrl;
};

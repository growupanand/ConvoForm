export const getAPIDomainUrl = (): string => {
  const fallbackUrl =
    process.env.NEXT_PUBLIC_PACKAGE_ENV === "production"
      ? "wss://convoform.onrender.com"
      : "ws://localhost:4000";
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? fallbackUrl;
};

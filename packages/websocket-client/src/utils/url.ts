export const getAPIDomainUrl = (): string => {
  // If working on developing this package
  if (
    process.env.NEXT_PUBLIC_PACKAGE_ENV &&
    process.env.NEXT_PUBLIC_PACKAGE_ENV === "development"
  ) {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:4000";
  }

  return "wss://convoform.onrender.com";
};

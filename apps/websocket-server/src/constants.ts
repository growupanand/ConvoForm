export const IS_PROD = process.env.NODE_ENV === "production";
export const apiEndpoint =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

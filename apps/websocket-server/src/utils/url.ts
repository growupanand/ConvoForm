import { IS_PROD } from "../constants";

export const getAPIDomainUrl = (): string => {
  const fallbackUrl = IS_PROD
    ? "https://www.convoform.com"
    : "http://localhost:3000";

  // Use environment variable with fallback to localhost
  return process.env.NEXT_PUBLIC_APP_URL || fallbackUrl;
};

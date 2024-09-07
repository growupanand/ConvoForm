import { IS_PROD } from "../constants";

export const getAPIDomainUrl = (): string => {
  if (IS_PROD) {
    return "https://www.convoform.com";
  }

  return "http://localhost:3000";
};

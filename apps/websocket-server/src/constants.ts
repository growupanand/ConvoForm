import { getAPIDomainUrl } from "./utils/url";

export const IS_PROD = process.env.NODE_ENV === "production";
export const API_DOMAIN_URL = getAPIDomainUrl();

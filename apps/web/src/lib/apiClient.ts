import { getBackendBaseUrl } from "./url";

type ApiClientOptions = RequestInit & {
  data?: Record<string, any>;
  queryParams?: Record<string, string>;
};

type ApiClient = (
  url: RequestInfo,
  fetchOptions: ApiClientOptions,
) => Promise<Response>;

export const apiClient: ApiClient = async (url, fetchOptions) => {
  const baseURl = getBackendBaseUrl();
  const { data, queryParams, ...otherFetchOptions } = fetchOptions;
  const headers = {
    "Content-Type": "application/json",
  } as Record<string, string>;

  let finalUrl = `${baseURl}/api/${url}`;

  if (queryParams) {
    // Create a paramsString from the queryParams object
    const params = new URLSearchParams(queryParams);
    const paramsString = params.toString();

    // Append paramsString to the finalUrl
    finalUrl = `${finalUrl}?${paramsString}`;
  }

  const response = await fetch(finalUrl, {
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...otherFetchOptions,
  });

  if (!response.ok) {
    throw response;
  }
  return response;
};

type ApiClientOptions = RequestInit & {
  data?: Record<string, any>;
};

type ApiClient = (
  url: NodeJS.fetch.RequestInfo,
  fetchOptions: ApiClientOptions,
) => Promise<Response>;

export const apiClient: ApiClient = async (url, fetchOptions) => {
  const { data, ...otherFetchOptions } = fetchOptions;
  const response = await fetch(`/api/${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    ...otherFetchOptions,
  });

  if (!response.ok) {
    throw response;
  }
  return response;
};

async function fetchApi<T = unknown>(
  input: RequestInfo,
  apiDomainUrl: string,
  init?: RequestInit,
): Promise<T> {
  if (apiDomainUrl.trim().length === 0) {
    throw new Error("API endpoint is not set");
  }

  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function apiClient(
  method: string,
  payload: Record<string, unknown>,
  apiDomainUrl: string,
) {
  return fetchApi(`${apiDomainUrl}/api/webhook/websocket`, apiDomainUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

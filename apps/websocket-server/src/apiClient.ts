import { signPayload } from "@convoform/common";

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
  internalSecret: string,
) {
  const body = JSON.stringify(payload);
  const signature = await signPayload(body, internalSecret);

  return fetchApi(`${apiDomainUrl}/api/webhook/websocket`, apiDomainUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-ConvoForm-Signature": signature,
    },
    body,
  });
}

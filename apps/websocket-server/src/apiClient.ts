import { apiEndpoint } from "./constants";

const isValidEndpoint =
  typeof apiEndpoint === "string" && apiEndpoint.trim().length > 0;

async function fetchApi<T = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  if (!isValidEndpoint) {
    throw new Error("API endpoint is not set");
  }

  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function apiClient(method: string, payload: Record<string, any>) {
  return fetchApi(`${apiEndpoint}/api/webhook/websocket`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

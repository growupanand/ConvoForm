/**
 * A `fetch` wrapper that applies the SSRF guard to every outbound request.
 *
 * Use it for user-supplied hosts (Custom AI providers today, and anything else
 * that accepts a base URL later). It:
 *
 * - validates the URL before the request, including a fresh DNS lookup;
 * - forces `redirect: "manual"` so a redirect cannot bypass the check;
 * - rejects any 3xx response instead of following it.
 */

import {
  type AssertSafeOutboundUrlOptions,
  UnsafeOutboundUrlError,
  assertSafeOutboundUrl,
} from "./ssrf";

export type GuardedFetchOptions = AssertSafeOutboundUrlOptions & {
  /** Underlying fetch implementation. Defaults to global `fetch`. */
  fetch?: FetchImplementation;
};

export type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type FetchWithPreconnect = typeof fetch & {
  /** Bun-only helper; absent on other runtimes. */
  preconnect?: (url: string | URL, options?: Record<string, unknown>) => void;
};

/**
 * Creates a `fetch` that refuses to talk to private, loopback, metadata or
 * redirecting hosts.
 */
export function createGuardedFetch(
  options: GuardedFetchOptions = {},
): typeof fetch {
  const fetchImpl = options.fetch ?? fetch;

  const guardedFetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const url = getRequestUrl(input);
    await assertSafeOutboundUrl(url, options);

    const request =
      input instanceof Request
        ? new Request(input, { redirect: "manual" })
        : input;

    const response = await fetchImpl(request, {
      ...init,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      throw new UnsafeOutboundUrlError(
        `${options.subject ?? "URL"} must not redirect`,
      );
    }

    return response;
  }) as FetchWithPreconnect;

  // Bun augments `fetch` with `preconnect`; keep the wrapper assignable to
  // provider `fetch` options on every runtime.
  const underlying = fetchImpl as FetchWithPreconnect;
  guardedFetch.preconnect = underlying.preconnect ?? (() => undefined);

  return guardedFetch;
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

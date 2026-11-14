import { assertSafeAiBaseUrl as assertSafe } from "@convoform/common";

/**
 * Local wrapper so router tests can replace the DNS check without mocking the
 * shared `@convoform/common` module (Bun module mocks are process-wide).
 */
export function assertSafeAiBaseUrl(
  url: string,
  options?: Parameters<typeof assertSafe>[1],
) {
  return assertSafe(url, options);
}

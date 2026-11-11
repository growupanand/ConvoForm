import { DecisionTimeoutError } from "./errors";

/**
 * Runs a decision call with a hard timeout. The signal cancels the underlying
 * request when supported; the race guarantees the caller never waits longer
 * than `timeoutMs` even if the provider ignores the signal.
 */
export async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new DecisionTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Secret redaction for logs and error reporting.
 *
 * Two layers:
 *
 * 1. Sensitive values registered for the current request are replaced
 *    literally, wherever they appear in a message or context.
 * 2. Well-known key shapes (OpenAI, Anthropic, Groq, Google, bearer tokens,
 *    `api_key=...`, and sensitive field names) are redacted even when they were
 *    never registered.
 *
 * The logger applies both layers before a record reaches Axiom or the console.
 */

export const REDACTED_VALUE = "[REDACTED]";

const MAX_TRACKED_VALUES = 1_000;
const MIN_TRACKED_VALUE_LENGTH = 8;

const sensitiveValues = new Set<string>();

const SENSITIVE_FIELD_NAMES = new Set([
  "apikey",
  "api_key",
  "access_token",
  "accesstoken",
  "authorization",
  "credential",
  "encryptedsecret",
  "encrypted_secret",
  "masterkey",
  "master_key",
  "password",
  "secret",
  "token",
  "wrappeddatakey",
  "wrapped_data_key",
]);

const TEXT_PATTERNS: Array<[RegExp, string]> = [
  [/sk-ant-[A-Za-z0-9_-]{16,}/g, REDACTED_VALUE],
  [/sk-proj-[A-Za-z0-9_-]{16,}/g, REDACTED_VALUE],
  [/sk-[A-Za-z0-9_-]{16,}/g, REDACTED_VALUE],
  [/gsk_[A-Za-z0-9_-]{16,}/g, REDACTED_VALUE],
  [/AIza[0-9A-Za-z_-]{20,}/g, REDACTED_VALUE],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/g, REDACTED_VALUE],
  [/(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, `$1${REDACTED_VALUE}`],
  [
    /((?:api[_-]?key|access[_-]?token|auth[_-]?token|token|secret|password)=)[^&\s"']+/gi,
    `$1${REDACTED_VALUE}`,
  ],
  [/(https?:\/\/)[^/\s:@]+:[^/\s@]+@/gi, `$1${REDACTED_VALUE}@`],
];

/**
 * Marks a value as sensitive for the current request. Must be paired with
 * `forgetSensitiveValue` so secrets are not retained longer than needed.
 */
export function registerSensitiveValue(value: string | null | undefined) {
  if (!value || value.length < MIN_TRACKED_VALUE_LENGTH) {
    return;
  }

  if (sensitiveValues.has(value)) {
    return;
  }

  if (sensitiveValues.size >= MAX_TRACKED_VALUES) {
    const oldest = sensitiveValues.values().next().value;
    if (oldest !== undefined) {
      sensitiveValues.delete(oldest);
    }
  }

  sensitiveValues.add(value);
}

/** Removes a previously registered value. */
export function forgetSensitiveValue(value: string | null | undefined) {
  if (value) {
    sensitiveValues.delete(value);
  }
}

/** Clears every registered value. Primarily for tests. */
export function clearSensitiveValues() {
  sensitiveValues.clear();
}

/** Redacts registered secrets and well-known key shapes from a string. */
export function redactText(value: string): string {
  let redacted = value;

  // Longest first so a secret that contains another secret is fully removed.
  const registered = [...sensitiveValues].sort((a, b) => b.length - a.length);
  for (const secret of registered) {
    redacted = redacted.split(secret).join(REDACTED_VALUE);
  }

  for (const [pattern, replacement] of TEXT_PATTERNS) {
    redacted = redacted.replace(pattern, replacement);
  }

  return redacted;
}

/**
 * Returns a deep copy of `value` with sensitive fields and values redacted.
 * Safe for arbitrary log context (cycles included).
 */
export function redactSensitiveData<T>(value: T): T {
  return redactValue(value, new WeakSet(), 0) as T;
}

const MAX_DEPTH = 8;

function redactValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (typeof value === "string") {
    return redactText(value);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    };
  }

  if (depth >= MAX_DEPTH || seen.has(value as object)) {
    return REDACTED_VALUE;
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen, depth + 1));
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    // Avoid walking class instances (clients, streams, requests). Their
    // stringification is redacted by the caller when needed.
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) {
      result[key] = REDACTED_VALUE;
      continue;
    }

    result[key] = redactValue(entry, seen, depth + 1);
  }

  return result;
}

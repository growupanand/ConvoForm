const SECRET_PREFIX = "whsec_";
const SIGNATURE_VERSION = "v1";

/**
 * How far a webhook timestamp may drift before consumers should reject it.
 * Matches the Svix default.
 */
export const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export interface WebhookSignatureHeaders {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
}

export interface CreateWebhookSignatureOptions {
  /** The `WebhookDelivery` id. */
  deliveryId: string;
  /** The plaintext endpoint secret (`whsec_...`). */
  secret: string;
  /** The exact raw request body that will be sent. */
  payload: string;
  /** Unix timestamp in seconds. Defaults to now. */
  timestamp?: number;
}

export interface VerifyWebhookSignatureOptions {
  secret: string;
  payload: string;
  headers:
    | Headers
    | Record<string, string | null | undefined>
    | Partial<WebhookSignatureHeaders>;
  toleranceSeconds?: number;
  /** Unix timestamp in seconds. Useful in tests. Defaults to now. */
  nowSeconds?: number;
}

/**
 * Generate a Svix-compatible webhook secret.
 *
 * Example: `whsec_<base64 encoded 32 random bytes>`
 */
export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `${SECRET_PREFIX}${bytesToBase64(bytes)}`;
}

/**
 * Create the Svix-compatible signature headers for an outgoing webhook.
 *
 * The signed content is `{webhook-id}.{webhook-timestamp}.{raw-body}` and the
 * signature is `v1,<base64 HMAC-SHA256>`.
 */
export async function createWebhookSignatureHeaders({
  deliveryId,
  secret,
  payload,
  timestamp = Math.floor(Date.now() / 1000),
}: CreateWebhookSignatureOptions): Promise<WebhookSignatureHeaders> {
  const webhookId = `msg_${deliveryId}`;
  const webhookTimestamp = String(timestamp);
  const signature = await signContent({
    secret,
    content: `${webhookId}.${webhookTimestamp}.${payload}`,
  });

  return {
    "webhook-id": webhookId,
    "webhook-timestamp": webhookTimestamp,
    "webhook-signature": `${SIGNATURE_VERSION},${signature}`,
  };
}

/**
 * Verify a Svix-compatible webhook signature.
 *
 * Supports multiple space-separated signatures, matching the Svix spec.
 */
export async function verifyWebhookSignature({
  secret,
  payload,
  headers,
  toleranceSeconds = WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyWebhookSignatureOptions): Promise<boolean> {
  const webhookId = getHeader(headers, "webhook-id");
  const webhookTimestamp = getHeader(headers, "webhook-timestamp");
  const webhookSignature = getHeader(headers, "webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  const timestamp = Number(webhookTimestamp);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return false;
  }

  const content = `${webhookId}.${webhookTimestamp}.${payload}`;
  const expected = base64ToBytes(await signContent({ secret, content }));
  if (!expected) {
    return false;
  }

  const candidates = webhookSignature.split(" ").filter(Boolean);
  for (const candidate of candidates) {
    const [version, value] = candidate.split(",");
    if (version !== SIGNATURE_VERSION || !value) {
      continue;
    }

    const actual = base64ToBytes(value);
    if (actual && constantTimeEqual(actual, expected)) {
      return true;
    }
  }

  return false;
}

async function signContent({
  secret,
  content,
}: {
  secret: string;
  content: string;
}): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    secretToKeyBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(content),
  );

  return bytesToBase64(new Uint8Array(signature));
}

function secretToKeyBytes(secret: string): Uint8Array {
  if (secret.startsWith(SECRET_PREFIX)) {
    const decoded = base64ToBytes(secret.slice(SECRET_PREFIX.length));
    if (!decoded) {
      throw new Error("Invalid webhook secret");
    }
    return decoded;
  }

  return new TextEncoder().encode(secret);
}

function getHeader(
  headers: VerifyWebhookSignatureOptions["headers"],
  name: keyof WebhookSignatureHeaders,
): string | null {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(name);
  }

  const record = headers as Record<string, string | null | undefined>;
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === name) {
      return value ?? null;
    }
  }

  return null;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;

  for (let index = 0; index < length; index++) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }

  return mismatch === 0;
}

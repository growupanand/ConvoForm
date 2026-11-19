/**
 * SSRF protection for user-supplied outbound URLs (webhooks and AI providers).
 *
 * The URL is checked once at creation time and again before every send, after
 * DNS resolution. Redirects are never followed, and only the default HTTPS
 * port (443) is allowed outside development.
 */

const DEFAULT_HTTPS_PORT = "443";
const DEFAULT_HTTP_PORT = "80";
const DNS_LOOKUP_TIMEOUT_MS = 5_000;

export class UnsafeOutboundUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeOutboundUrlError";
  }
}

/**
 * @deprecated Use `UnsafeOutboundUrlError`. Kept as an alias so existing
 * webhook imports keep working.
 */
export { UnsafeOutboundUrlError as UnsafeWebhookUrlError };

export type OutboundHostResolver = (hostname: string) => Promise<string[]>;

/** @deprecated Use `OutboundHostResolver`. */
export type WebhookHostResolver = OutboundHostResolver;

export interface AssertSafeOutboundUrlOptions {
  /** Override DNS resolution. Mainly used by tests. */
  resolver?: OutboundHostResolver;
  /** Defaults to `NODE_ENV === "development"`. */
  allowHttpLocalhost?: boolean;
  /** Human-readable subject used in error messages. */
  subject?: string;
}

/** @deprecated Use `AssertSafeOutboundUrlOptions`. */
export type AssertSafeWebhookUrlOptions = AssertSafeOutboundUrlOptions;

/**
 * Validate an outbound URL and every address its hostname resolves to.
 *
 * Returns the parsed URL when safe and throws `UnsafeOutboundUrlError`
 * otherwise.
 */
export async function assertSafeOutboundUrl(
  rawUrl: string,
  options: AssertSafeOutboundUrlOptions = {},
): Promise<URL> {
  const subject = options.subject ?? "URL";

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeOutboundUrlError(`${subject} is not a valid URL`);
  }

  if (url.username || url.password) {
    throw new UnsafeOutboundUrlError(`${subject} must not contain credentials`);
  }

  const allowHttpLocalhost =
    options.allowHttpLocalhost ?? process.env.NODE_ENV === "development";
  const hostname = normalizeHostname(url.hostname);
  const isLoopbackHost = isLoopbackHostname(hostname);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new UnsafeOutboundUrlError(
      `${subject} must use https (http is only allowed for localhost in development)`,
    );
  }

  if (url.protocol === "http:") {
    if (!allowHttpLocalhost || !isLoopbackHost) {
      throw new UnsafeOutboundUrlError(
        `${subject} must use https (http is only allowed for localhost in development)`,
      );
    }

    if (url.port && url.port !== DEFAULT_HTTP_PORT) {
      throw new UnsafeOutboundUrlError(
        `${subject} must use port 80 for http localhost`,
      );
    }

    return url;
  }

  if (url.port && url.port !== DEFAULT_HTTPS_PORT) {
    throw new UnsafeOutboundUrlError(`${subject} must use port 443`);
  }

  // Localhost is only reachable in development.
  if (isLoopbackHost) {
    if (!allowHttpLocalhost) {
      throw new UnsafeOutboundUrlError(
        `${subject} must not point to localhost`,
      );
    }

    return url;
  }

  const addresses = isIpLiteral(hostname)
    ? [hostname]
    : await (options.resolver ?? resolveWebhookHostname)(hostname);

  if (!addresses.length) {
    throw new UnsafeOutboundUrlError(
      `${subject} hostname did not resolve to an address`,
    );
  }

  for (const address of addresses) {
    if (isBlockedIpAddress(address)) {
      throw new UnsafeOutboundUrlError(
        `${subject} must not point to a private, loopback or metadata address`,
      );
    }
  }

  return url;
}

/**
 * Webhook-specific wrapper around `assertSafeOutboundUrl`.
 */
export async function assertSafeWebhookUrl(
  rawUrl: string,
  options: AssertSafeWebhookUrlOptions = {},
): Promise<URL> {
  return assertSafeOutboundUrl(rawUrl, { ...options, subject: "Webhook URL" });
}

/**
 * AI provider base URL wrapper around `assertSafeOutboundUrl`.
 *
 * Used for the Custom (OpenAI-compatible) provider: https on port 443 only,
 * no credentials in the URL, and no private, loopback or metadata addresses.
 */
export async function assertSafeAiBaseUrl(
  rawUrl: string,
  options: AssertSafeOutboundUrlOptions = {},
): Promise<URL> {
  return assertSafeOutboundUrl(rawUrl, {
    ...options,
    subject: "AI provider base URL",
  });
}

/**
 * Returns true for loopback, private, link-local, CGNAT, unspecified,
 * multicast and IPv4-mapped versions of those IPv6 addresses.
 */
export function isBlockedIpAddress(address: string): boolean {
  const normalized = stripIpv6Brackets(address).toLowerCase().split("%")[0];
  if (!normalized) {
    return true;
  }

  if (isIpv4Literal(normalized)) {
    return isBlockedIpv4(normalized);
  }

  if (normalized.includes(":")) {
    return isBlockedIpv6(normalized);
  }

  // Unknown hostname-shaped input is considered unsafe when used as an IP.
  return true;
}

function isBlockedIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b] = parts as [number, number, number, number];

  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8
  if (a === 127) return true;
  // 169.254.0.0/16 (including 169.254.169.254 cloud metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 100.64.0.0/10 CGNAT
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 224.0.0.0/4 multicast plus 240.0.0.0/4 reserved/broadcast
  if (a >= 224) return true;

  return false;
}

function isBlockedIpv6(address: string): boolean {
  const hextets = parseIpv6(address);
  if (!hextets) {
    return true;
  }

  const bytes = hextetsToBytes(hextets);

  // :: (unspecified)
  if (bytes.every((byte) => byte === 0)) {
    return true;
  }

  // ::1 (loopback)
  if (bytes.slice(0, 15).every((byte) => byte === 0) && bytes[15] === 1) {
    return true;
  }

  // fc00::/7 (unique local)
  if (((bytes[0] ?? 0) & 0xfe) === 0xfc) {
    return true;
  }

  // fe80::/10 (link-local)
  if (bytes[0] === 0xfe && ((bytes[1] ?? 0) & 0xc0) === 0x80) {
    return true;
  }

  // ff00::/8 (multicast)
  if (bytes[0] === 0xff) {
    return true;
  }

  // ::ffff:0:0/96 (IPv4-mapped)
  if (
    bytes.slice(0, 10).every((byte) => byte === 0) &&
    bytes[10] === 0xff &&
    bytes[11] === 0xff
  ) {
    const ipv4 = `${bytes[12]}.${bytes[13]}.${bytes[14]}.${bytes[15]}`;
    return isBlockedIpv4(ipv4);
  }

  return false;
}

function parseIpv6(address: string): number[] | null {
  if (!address.includes(":")) {
    return null;
  }

  let normalized = address;

  // Handle an embedded dotted IPv4 suffix, e.g. ::ffff:192.168.0.1
  const lastColon = normalized.lastIndexOf(":");
  const maybeIpv4 = normalized.slice(lastColon + 1);
  if (isIpv4Literal(maybeIpv4)) {
    const parts = maybeIpv4.split(".").map(Number);
    if (
      parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
    ) {
      return null;
    }
    const [first = 0, second = 0, third = 0, fourth = 0] = parts;
    const high = ((first << 8) | second).toString(16);
    const low = ((third << 8) | fourth).toString(16);
    normalized = `${normalized.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) {
    return null;
  }

  const parseGroups = (value: string): number[] | null => {
    if (!value) {
      return [];
    }

    const groups = value.split(":");
    const parsed: number[] = [];
    for (const group of groups) {
      if (!/^[0-9a-f]{1,4}$/i.test(group)) {
        return null;
      }
      parsed.push(Number.parseInt(group, 16));
    }
    return parsed;
  };

  const head = parseGroups(halves[0] ?? "");
  const tail = halves.length === 2 ? parseGroups(halves[1] ?? "") : [];
  if (!head || !tail) {
    return null;
  }

  if (halves.length === 1) {
    return head.length === 8 ? head : null;
  }

  const fill = 8 - head.length - tail.length;
  if (fill < 1) {
    return null;
  }

  return [...head, ...new Array(fill).fill(0), ...tail];
}

function hextetsToBytes(hextets: number[]): number[] {
  const bytes: number[] = [];
  for (const hextet of hextets) {
    bytes.push((hextet >> 8) & 0xff, hextet & 0xff);
  }
  return bytes;
}

/**
 * Default resolver: use Node's DNS when available, otherwise DNS-over-HTTPS.
 *
 * Cloudflare Workers/Next Edge have no Node DNS module, so the DoH fallback
 * keeps the same check available on every runtime.
 */
export const resolveWebhookHostname: WebhookHostResolver = async (hostname) => {
  const nodeAddresses = await resolveWithNodeDns(hostname);
  if (nodeAddresses) {
    return nodeAddresses;
  }

  return resolveWithDoh(hostname);
};

async function resolveWithNodeDns(hostname: string): Promise<string[] | null> {
  try {
    const getBuiltinModule = (
      process as unknown as {
        getBuiltinModule?: (id: string) => unknown;
      }
    ).getBuiltinModule;

    if (typeof getBuiltinModule !== "function") {
      return null;
    }

    const dns = getBuiltinModule("node:dns/promises") as {
      lookup: (
        hostname: string,
        options: { all: true; verbatim: true },
      ) => Promise<Array<{ address: string }>>;
    };

    const results = await dns.lookup(hostname, { all: true, verbatim: true });
    return results.map((result) => result.address);
  } catch {
    return null;
  }
}

async function resolveWithDoh(hostname: string): Promise<string[]> {
  const results = await Promise.allSettled([
    lookupDoh(hostname, "A"),
    lookupDoh(hostname, "AAAA"),
  ]);

  const addresses = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (!addresses.length) {
    throw new UnsafeOutboundUrlError("Unable to resolve hostname safely");
  }

  return addresses;
}

async function lookupDoh(
  hostname: string,
  type: "A" | "AAAA",
): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
    hostname,
  )}&type=${type}`;

  const response = await fetch(url, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(DNS_LOOKUP_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`DNS lookup failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    Answer?: Array<{ type: number; data: string }>;
  };

  const expectedType = type === "A" ? 1 : 28;
  return (data.Answer ?? [])
    .filter((answer) => answer.type === expectedType)
    .map((answer) => answer.data);
}

function normalizeHostname(hostname: string): string {
  const withoutBrackets = stripIpv6Brackets(hostname).toLowerCase();
  return withoutBrackets.endsWith(".")
    ? withoutBrackets.slice(0, -1)
    : withoutBrackets;
}

function stripIpv6Brackets(value: string): string {
  return value.startsWith("[") && value.endsWith("]")
    ? value.slice(1, -1)
    : value;
}

function isIpLiteral(hostname: string): boolean {
  return isIpv4Literal(hostname) || hostname.includes(":");
}

function isIpv4Literal(value: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(value);
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

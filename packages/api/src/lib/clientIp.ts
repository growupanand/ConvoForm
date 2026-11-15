type RequestContext = {
  headers?: Headers;
  req?: Request;
};

/**
 * Resolve the caller's IP from the proxy headers added by the hosting platform.
 * Falls back to a stable value so anonymous callers still share a bucket.
 */
export function getClientIp(ctx: RequestContext): string {
  const headers = ctx.headers ?? ctx.req?.headers;
  const forwardedFor = headers?.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    headers?.get("x-real-ip") ||
    headers?.get("cf-connecting-ip") ||
    "unknown"
  );
}

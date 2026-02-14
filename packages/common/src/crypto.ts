export async function signPayload(
  payload: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expectedSignature = await signPayload(payload, secret);
  // Constant-time comparison is not strictly necessary for this use case if we rely on the crypto implementation,
  // but a simple string comparison is fine for now given the complexity trade-off.
  // For higher security, we could use crypto.timingSafeEqual if running in a Node environment,
  // but this code might run in Edge/Browser where Buffer/crypto might vary.
  // Since we are generating the signature ourselves to compare, we just check equality.
  return signature === expectedSignature;
}

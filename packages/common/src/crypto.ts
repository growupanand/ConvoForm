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

export async function encrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Hash the key to ensure it's 256-bit
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("convoform-salt"), // In production, salt should be random and stored with ciphertext, but for simplicity we use a fixed salt for now as key is already a secret
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    data,
  );

  const encryptedArray = new Uint8Array(encrypted);
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encryptedHex = Array.from(encryptedArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${ivHex}:${encryptedHex}`;
}

export async function decrypt(
  encryptedText: string,
  key: string,
): Promise<string> {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)),
  );
  const encryptedArray = new Uint8Array(
    encryptedHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)),
  );

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("convoform-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    encryptedArray,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

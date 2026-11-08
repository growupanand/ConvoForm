/// <reference types="node" />

const INTERNAL_EMAIL_API_SECRET = process.env.INTERNAL_EMAIL_API_SECRET;
const RESPONSE_ID = process.env.TEST_RESPONSE_ID;

if (!INTERNAL_EMAIL_API_SECRET) {
  console.error(
    "Error: INTERNAL_EMAIL_API_SECRET is not set in environment variables.",
  );
  console.error(
    "Make sure you are running this script with access to your .env file.",
  );
  console.error("Example: bun packages/email/test-trpc-trigger.ts");
  process.exit(1);
}

if (!RESPONSE_ID) {
  console.error("Error: TEST_RESPONSE_ID is not set in environment variables.");
  console.error(
    "Set it to the id of a completed conversation to resend its owner email.",
  );
  process.exit(1);
}

// The endpoint only accepts a response id. Form name, recipient, field
// responses and transcript are all loaded from the database server-side.
const payload = {
  responseId: RESPONSE_ID,
};

async function signPayload(payload: string, secret: string) {
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
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function triggerEmail() {
  const url = "http://localhost:3000/api/trpc/email.sendFormResponse";

  console.log(`Sending POST request to ${url}`);
  console.log("Payload:", payload);

  try {
    // Construct body for tRPC with superjson
    // Standard tRPC single mutation body with superjson: { json: <input> }
    const bodyObj = {
      json: payload,
    };
    const bodyStr = JSON.stringify(bodyObj);

    // biome-ignore lint/style/noNonNullAssertion: checked above
    const signature = await signPayload(bodyStr, INTERNAL_EMAIL_API_SECRET!);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ConvoForm-Signature": signature,
      },
      body: bodyStr,
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`Request failed with status ${response.status}`);
      console.error("Response body:", responseText);
      return;
    }

    try {
      const json = JSON.parse(responseText);
      console.log("Success! Response:", JSON.stringify(json, null, 2));
    } catch (_e) {
      console.log("Success! Response (text):", responseText);
    }
  } catch (error) {
    console.error("Network error:", error);
    console.error("Make sure the web server is running on localhost:3000");
  }
}

triggerEmail();

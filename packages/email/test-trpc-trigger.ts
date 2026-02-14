/// <reference types="node" />

const INTERNAL_EMAIL_API_SECRET = process.env.INTERNAL_EMAIL_API_SECRET;

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

const payload = {
  to: "growupanand@gmail.com", // Replace if needed
  formName: "Test Form Trigger",
  responseId: `test-response-${Date.now()}`,
  respondentEmail: "growupanand@gmail.com",
  responseLink: "https://example.com/response",
  secret: "sec_cb9a74b0b2e39067687a24a957383605",
  currentFieldResponses: [
    { fieldName: "Name", fieldValue: "Test User" },
    { fieldName: "Feedback", fieldValue: "This is a test from the script." },
  ],
  transcript: [
    { role: "assistant", content: "How can I help you?" },
    { role: "user", content: "I am testing the email trigger." },
  ],
  metadata: {
    source: "script",
    timestamp: new Date().toISOString(),
  },
};

// Simulate signing
// We need to implement signPayload here or import it if possible.
// Since this is a script, importing from local package might work if compiled, or we just copy the simple logic.

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
  console.log("Payload (redacted secret):", { ...payload, secret: "***" });

  try {
    // Construct body for tRPC with superjson
    // Standard tRPC single mutation body with superjson: { json: <input> }
    const bodyObj = {
      json: payload,
    };
    const bodyStr = JSON.stringify(bodyObj);

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
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

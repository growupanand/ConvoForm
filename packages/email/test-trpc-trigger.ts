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



async function triggerEmail() {
  const url = "http://localhost:3000/api/trpc/email.sendFormResponse";

  console.log(`Sending POST request to ${url}`);
  console.log("Payload (redacted secret):", { ...payload, secret: "***" });

  try {
    // Construct body for tRPC with superjson
    // Standard tRPC single mutation body with superjson: { json: <input> }
    const body = {
      json: payload,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

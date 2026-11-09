/**
 * Verification snippet shown in the one-time secret dialog. Keep it in sync
 * with the Node.js example on the webhooks docs page.
 */
export const NODE_WEBHOOK_VERIFICATION_SNIPPET = `import crypto from "node:crypto";

export async function POST(request: Request) {
  const secret = process.env.CONVOFORM_WEBHOOK_SECRET ?? "";
  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("webhook-timestamp") ?? "";
  const signature = request.headers.get("webhook-signature") ?? "";

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 5 * 60) {
    return new Response("Timestamp outside tolerance", { status: 401 });
  }

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = \`v1,\${crypto
    .createHmac("sha256", key)
    .update(\`\${webhookId}.\${timestamp}.\${rawBody}\`)
    .digest("base64")}\`;

  const expectedBuffer = Buffer.from(expected);
  const valid = signature.split(" ").some((part) => {
    const actualBuffer = Buffer.from(part);
    return (
      actualBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    );
  });

  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log("Received", event.type, event.data.responseId);

  return new Response(null, { status: 200 });
}`;

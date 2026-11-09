import { recordWebhookDeliveryResult } from "@convoform/api/src/actions/webhook";
import { db } from "@convoform/db";
import { webhookDeliveryResultSchema } from "@convoform/db/src/schema";
import { type NextRequest, NextResponse } from "next/server";
import { verifyInternalRequest } from "../_utils";
import { sendWebhookDisabledEmail } from "./email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const verification = await verifyInternalRequest(request);
  if (!verification.ok) {
    return verification.response;
  }

  let body: unknown;
  try {
    body = JSON.parse(verification.rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = webhookDeliveryResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const result = await recordWebhookDeliveryResult(parsed.data, { db });

    if (result.endpointDisabled && result.ownerEmail && result.formName) {
      try {
        await sendWebhookDisabledEmail({
          to: result.ownerEmail,
          formName: result.formName,
        });
      } catch (error) {
        // The delivery result is already recorded. Never let a notification
        // failure change the response.
        console.error("Failed to send webhook-disabled email", error);
      }
    }

    return NextResponse.json({
      ok: true,
      status: result.status,
      endpointDisabled: result.endpointDisabled,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Webhook delivery not found")
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Failed to record webhook delivery result", error);
    return NextResponse.json(
      { error: "Failed to record webhook delivery result" },
      { status: 500 },
    );
  }
}

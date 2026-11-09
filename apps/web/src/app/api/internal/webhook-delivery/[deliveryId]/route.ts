import {
  WebhookDeliveryNotFoundError,
  WebhookEndpointDisabledError,
  getSignedWebhookRequest,
} from "@convoform/api/src/actions/webhook";
import { UnsafeWebhookUrlError } from "@convoform/common";
import { db } from "@convoform/db";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyInternalRequest } from "../../_utils";

export const runtime = "nodejs";

const loadRequestSchema = z.object({
  deliveryId: z.string().min(1).optional(),
});

async function handle(
  request: NextRequest,
  context: { params: Promise<{ deliveryId: string }> },
) {
  const verification = await verifyInternalRequest(request);
  if (!verification.ok) {
    return verification.response;
  }

  const { deliveryId } = await context.params;
  if (!deliveryId) {
    return NextResponse.json({ error: "Missing delivery id" }, { status: 400 });
  }

  if (verification.rawBody.trim()) {
    let body: unknown;
    try {
      body = JSON.parse(verification.rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = loadRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (parsed.data.deliveryId && parsed.data.deliveryId !== deliveryId) {
      return NextResponse.json(
        { error: "Delivery id in body does not match the URL" },
        { status: 400 },
      );
    }
  }

  try {
    const signedRequest = await getSignedWebhookRequest(deliveryId, { db });

    return NextResponse.json(signedRequest, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof WebhookDeliveryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof WebhookEndpointDisabledError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof UnsafeWebhookUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Failed to build signed webhook request", error);
    return NextResponse.json(
      { error: "Failed to build signed webhook request" },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;

import { analytics } from "@convoform/analytics";
import {
  toResendWebhookAnalyticsEvent,
  verifyResendWebhookEvent,
} from "@convoform/email";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = await req.text();

  let event: ReturnType<typeof verifyResendWebhookEvent>;
  try {
    event = verifyResendWebhookEvent({
      payload,
      headers: {
        id: req.headers.get("svix-id"),
        timestamp: req.headers.get("svix-timestamp"),
        signature: req.headers.get("svix-signature"),
      },
    });
  } catch (error) {
    // Never log the raw payload: it contains recipient addresses and subjects.
    console.error("Failed to verify Resend webhook signature", error);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const analyticsEvent = toResendWebhookAnalyticsEvent(event);

  if (analyticsEvent) {
    try {
      await analytics.track(analyticsEvent.eventName, {
        distinctId: analyticsEvent.distinctId,
        properties: analyticsEvent.properties,
      });
    } catch (error) {
      // Acknowledge delivery even when analytics is unavailable so Resend does
      // not retry the same event indefinitely.
      console.error("Failed to track Resend webhook event", error);
    }
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { WebhookEvent } from "@clerk/clerk-sdk-node";

export async function POST(req: NextRequest) {
  const reqJson = await req.json();
  console.log("Handling webhook event");

  const event = reqJson as WebhookEvent;

  switch (event.type) {
    case "user.created":
      console.log("user created event received");
      const { data } = event;
      try {
        const email =
          data.email_addresses.length > 0
            ? data.email_addresses[0]?.email_address
            : "";
        const user = {
          email: email,
          firstName: data.first_name,
          lastName: data.last_name,
          userId: data.id,
          imageUrl: data.image_url,
        };
        await prisma.user.create({
          data: user,
        });
        console.log("user created successfully in our database");
      } catch (e) {
        console.error({
          message: "Unable to create user",
          data: data,
          errorMessage: e.message,
        });
      }
      break;

    default:
    // Unhandled event type
  }

  return NextResponse.json({ success: true });
}

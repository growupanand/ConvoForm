import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const reqJson = req.json();
  console.log("Handling webhook event");

  const { type: eventType, data } = reqJson as Record<string, any>;

  switch (eventType) {
    case "user.created":
      console.log("user created event received");
      try {
        const email = data.email_addresses?.[0]?.email_address;
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
        });
      }
      break;

    default:
    // Unhandled event type
  }

  return NextResponse.json({ success: true });
}

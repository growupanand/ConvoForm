import { type WebhookEvent, verifyWebhook } from "@clerk/nextjs/webhooks";
import {
  handleOrganizationCreated,
  handleOrganizationDeleted,
  handleOrganizationMembershipCreated,
  handleOrganizationMembershipDeleted,
  handleUserCreated,
  handleUserDeleted,
} from "@convoform/api/src/actions/webhook";
import { db } from "@convoform/db";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let event: WebhookEvent;
  try {
    event = await verifyWebhook(req);
  } catch (error) {
    // Never log the raw payload: it contains user and organization data.
    console.error("Failed to verify Clerk webhook signature", error);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const ctx = { db };

  switch (event.type) {
    case "user.created": {
      const { data } = event;
      const email =
        data.email_addresses.length > 0
          ? data.email_addresses[0]?.email_address
          : "";
      const signupMethod =
        data.external_accounts.length > 0
          ? data.external_accounts[0]?.provider ?? "oauth"
          : "email";
      await handleUserCreated(
        {
          email: email ?? "",
          firstName: data.first_name,
          lastName: data.last_name,
          userId: data.id,
          imageUrl: data.image_url,
          signupMethod,
        },
        ctx,
      );
      break;
    }
    case "user.deleted": {
      const { data } = event;
      if (!data.id) {
        throw new Error("user.deleted - User id not found in event data");
      }
      await handleUserDeleted({ userId: data.id }, ctx);
      break;
    }

    case "organization.created": {
      const { data } = event;
      await handleOrganizationCreated(
        {
          name: data.name,
          organizationId: data.id,
          slug: data.slug ?? "",
          createdByClerkUserId: data.created_by,
        },
        ctx,
      );
      break;
    }
    case "organizationMembership.created": {
      const { data: orgMembershipData } = event;
      await handleOrganizationMembershipCreated(
        {
          memberId: orgMembershipData.id,
          organizationId: orgMembershipData.organization.id,
          userId: orgMembershipData.public_user_data.user_id,
          role: orgMembershipData.role,
        },
        ctx,
      );
      break;
    }

    case "organizationMembership.deleted": {
      const { data: orgMembershipDeletedData } = event;
      await handleOrganizationMembershipDeleted(
        { membershipId: orgMembershipDeletedData.id },
        ctx,
      );
      break;
    }

    case "organization.deleted": {
      const { data } = event;
      if (!data.id) {
        throw new Error(
          "organization.deleted - organization id not found in event data",
        );
      }
      await handleOrganizationDeleted({ organizationId: data.id }, ctx);
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ success: true });
}

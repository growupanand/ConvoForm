/* eslint-disable no-case-declarations */

import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import { insertUserSchema } from "@convoform/db/src/schema";
import { type NextRequest, NextResponse } from "next/server";

import { api } from "@/trpc/server";

export async function POST(req: NextRequest) {
  const event = (await req.json()) as WebhookEvent;

  switch (event.type) {
    case "user.created": {
      const { data } = event;
      const email =
        data.email_addresses.length > 0
          ? data.email_addresses[0]?.email_address
          : "";
      const newUser = insertUserSchema.parse({
        email: email,
        firstName: data.first_name,
        lastName: data.last_name,
        userId: data.id,
        imageUrl: data.image_url,
      });
      await api.webhook.userCreated(newUser);
      break;
    }
    case "user.deleted":
      {
        const { data } = event;
        if (!data.id) {
          throw new Error("user.deleted - User id not found in event data");
        }
        await api.webhook.userDeleted({ userId: data.id });
      }
      break;

    case "organization.created": {
      const { data } = event;
      const org = {
        name: data.name,
        organizationId: data.id,
        slug: data.slug ?? "",
      };
      await api.webhook.organizationCreated(org);
      break;
    }
    case "organizationMembership.created": {
      const { data: orgMembershipData } = event;
      const orgMembership = {
        memberId: orgMembershipData.id,
        organizationId: orgMembershipData.organization.id,
        userId: orgMembershipData.public_user_data.user_id,
        role: orgMembershipData.role,
      };
      await api.webhook.organizationMembershipCreated(orgMembership);
      break;
    }

    case "organizationMembership.deleted": {
      const { data: orgMembershipDeletedData } = event;
      await api.webhook.organizationMembershipDeleted({
        membershipId: orgMembershipDeletedData.id,
      });
      break;
    }

    case "organization.deleted": {
      const { data } = event;
      if (!data.id) {
        throw new Error(
          "organization.deleted - organization id not found in event data",
        );
      }
      await api.webhook.organizationDeleted({
        organizationId: data.id,
      });
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ success: true });
}

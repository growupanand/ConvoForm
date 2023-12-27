import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Organization, OrganizationMember } from "@prisma/client";

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
    case "user.deleted":
      console.log("user deleted event received");
      const { data: userData } = event;
      try {
        if (!userData.id) {
          console.log("user id not found in event data");
          break;
        }
        await prisma.user.deleteMany({
          where: {
            userId: userData.id,
          },
        });
        console.log("user deleted successfully in our database");
      } catch (e) {
        console.error({
          message: "Unable to delete user",
          data: userData,
          errorMessage: e.message,
        });
      }
      break;

    case "organization.created":
      console.log("organization created event received");
      const { data: orgData } = event;
      try {
        const org = {
          name: orgData.name,
          organizationId: orgData.id,
          slug: orgData.slug || "",
        };
        await prisma.organization.create({
          data: org,
        });
        console.log("organization created successfully in our database");
      } catch (e) {
        console.error({
          message: "Unable to create organization",
          data: orgData,
          errorMessage: e.message,
        });
      }
      break;
    case "organizationMembership.created":
      console.log("organizationMembership created event received");
      const { data: orgMembershipData } = event;
      try {
        const orgMembership = {
          memberId: orgMembershipData.id,
          organizationId: orgMembershipData.organization.id,
          userId: orgMembershipData.public_user_data.user_id,
          role: orgMembershipData.role,
        };
        await prisma.organizationMember.create({
          data: orgMembership,
        });
        console.log(
          "organizationMembership created successfully in our database"
        );
      } catch (e) {
        console.error({
          message: "Unable to create organizationMembership",
          data: orgMembershipData,
          errorMessage: e.message,
        });
      }
      break;

    default:
    // Unhandled event type
  }

  return NextResponse.json({ success: true });
}

import { clerkClient } from "@clerk/nextjs/server";

import { api } from "@/trpc/server";
import {
  personalWorkspaceName,
  personalWorkspaceSlug,
  readPersonalWorkspaceOrganizationId,
} from "./personalWorkspace";

type WorkspaceResolution =
  | { kind: "activate"; organizationId: string }
  | { kind: "picker" };

export async function resolvePersonalWorkspace(
  userId: string,
): Promise<WorkspaceResolution> {
  const client = await clerkClient();
  const [memberships, user] = await Promise.all([
    client.users.getOrganizationMembershipList({ userId, limit: 10 }),
    client.users.getUser(userId),
  ]);
  const savedOrganizationId = readPersonalWorkspaceOrganizationId(
    user.privateMetadata,
  );
  const onlyMembership = memberships.data[0];

  if (memberships.totalCount === 1 && onlyMembership) {
    if (savedOrganizationId === onlyMembership.organization.id) {
      return {
        kind: "activate",
        organizationId: onlyMembership.organization.id,
      };
    }

    return { kind: "picker" };
  }

  if (memberships.totalCount > 0 || savedOrganizationId) {
    return { kind: "picker" };
  }

  const name = personalWorkspaceName(user.firstName);
  let organization: Awaited<
    ReturnType<typeof client.organizations.createOrganization>
  >;

  try {
    organization = await client.organizations.createOrganization({
      name,
      slug: personalWorkspaceSlug(name),
      createdBy: userId,
    });
  } catch (error) {
    console.error("Failed to create personal workspace", error);
    return { kind: "picker" };
  }

  try {
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        personalWorkspaceOrganizationId: organization.id,
      },
    });
  } catch (error) {
    console.error("Failed to remember personal workspace", error);
  }

  try {
    const membershipList = await client.users.getOrganizationMembershipList({
      userId,
      limit: 10,
    });
    const membership = membershipList.data.find(
      (item) => item.organization.id === organization.id,
    );

    await api.webhook.organizationCreated({
      name: organization.name,
      organizationId: organization.id,
      slug: organization.slug,
      createdByClerkUserId: userId,
    });

    if (membership) {
      await api.webhook.organizationMembershipCreated({
        memberId: membership.id,
        organizationId: organization.id,
        userId,
        role: membership.role,
      });
    }
  } catch (error) {
    console.error("Failed to record personal workspace", error);
  }

  return { kind: "activate", organizationId: organization.id };
}

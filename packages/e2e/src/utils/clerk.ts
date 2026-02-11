import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

const TEST_EMAIL = "e2e_test_user_v1@example.com";
const TEST_PASSWORD = "Password123!@#";

export const getOrCreateTestUser = async () => {
  try {
    // Check if user exists
    const users = await clerkClient.users.getUserList({
      emailAddress: [TEST_EMAIL],
    });

    if (users.data.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const user = users.data[0]!;
      // Optional: Update password to ensure it matches
      try {
        await clerkClient.users.updateUser(user.id, {
          password: TEST_PASSWORD,
          skipPasswordChecks: true,
        });
      } catch (e) {
        // Password might be same or specialized error, ignore for now
        console.log("Password update skipped or failed", e);
      }
      return { user, email: TEST_EMAIL, password: TEST_PASSWORD };
    }

    // Create new user
    const user = await clerkClient.users.createUser({
      emailAddress: [TEST_EMAIL],
      password: TEST_PASSWORD,
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
    return { user, email: TEST_EMAIL, password: TEST_PASSWORD };
  } catch (error) {
    console.error("Failed to get or create test user:", error);
    throw error;
  }
};

const TEST_ORG_NAME = "E2E Test Org";

/**
 * Ensures the test user has an organization. If the user already belongs to
 * an organization, returns the first one. Otherwise, creates a new organization.
 *
 * @example
 * ```ts
 * const { user } = await getOrCreateTestUser();
 * const org = await getOrCreateTestOrganization(user.id);
 * console.log(org.name); // "E2E Test Org"
 * ```
 */
export const getOrCreateTestOrganization = async (userId: string) => {
  try {
    // Check if user already has an organization
    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId,
    });

    if (memberships.data.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: guaranteed by length check
      const existingOrg = memberships.data[0]!.organization;
      console.log(
        `Test user already has organization: ${existingOrg.name} (${existingOrg.id})`,
      );
      return existingOrg;
    }

    // Create a new organization for the test user
    const org = await clerkClient.organizations.createOrganization({
      name: TEST_ORG_NAME,
      createdBy: userId,
    });
    console.log(`Created test organization: ${org.name} (${org.id})`);
    return org;
  } catch (error) {
    console.error("Failed to get or create test organization:", error);
    throw error;
  }
};

export const deleteTestUser = async (userId: string) => {
  try {
    await clerkClient.users.deleteUser(userId);
  } catch (error) {
    console.error("Failed to delete test user:", error);
  }
};

import path from "node:path";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import {
  getOrCreateTestOrganization,
  getOrCreateTestUser,
} from "../utils/clerk";

// Setup must be run serially, this is necessary if Playwright is configured
// to run fully parallel: https://playwright.dev/docs/test-parallel
setup.describe.configure({ mode: "serial" });

// Configure Playwright with Clerk (obtains Testing Token)
setup("global setup", async () => {
  await clerkSetup();
});

// Define the path to the storage file
const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate and save state to storage", async ({ page }) => {
  // Create or get test user credentials and ensure they have an organization
  const { user, email, password } = await getOrCreateTestUser();
  await getOrCreateTestOrganization(user.id);

  console.log(`Authenticating test user: ${email}`);

  // Navigate to an unprotected page that loads Clerk first
  await page.goto("/");

  try {
    // Use Clerk's signIn helper (internally uses setupClerkTestingToken)
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email,
        password: password,
      },
    });
  } catch (_error) {
    // If we are already signed in, we might get an error.
    // We can check if we are already redirected or just ignore if valid.
    console.log("Sign in attempt finished, checking if authenticated...");
  }

  // Navigate to a protected page to verify auth worked
  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard**", { timeout: 30000 });

  // Save storage state for reuse in other tests
  await page.context().storageState({ path: authFile });
});

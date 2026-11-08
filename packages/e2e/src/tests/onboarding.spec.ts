import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

import {
  createOnboardingTestUser,
  deleteOnboardingTestUser,
} from "../utils/clerk";

test.use({ storageState: { cookies: [], origins: [] } });

test("new user lands on forms without the organization screen", async ({
  page,
}) => {
  test.setTimeout(180_000);

  const { user, email, password } = await createOnboardingTestUser();

  try {
    // The landing page defers loading Clerk until first interaction, so start
    // from a page that mounts Clerk before using the testing helper.
    await page.goto("/auth/sign-in");
    await expect(page.locator(".cl-rootBox").first()).toBeVisible({
      timeout: 30_000,
    });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email,
        password,
      },
    });

    await page.goto("/dashboard");
    await page.waitForURL("**/forms", { timeout: 90_000 });

    await expect(page).not.toHaveURL(/\/organizations/);
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("button", { name: "New Form", exact: true }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("No Forms Yet")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("Ava's workspace")).toBeVisible({
      timeout: 30_000,
    });
  } finally {
    await deleteOnboardingTestUser(user.id);
  }
});

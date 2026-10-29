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
  test.setTimeout(90_000);

  const { user, email, password } = await createOnboardingTestUser();

  try {
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email,
        password,
      },
    });

    await page.goto("/dashboard");
    await page.waitForURL("**/forms", { timeout: 45_000 });

    await expect(page).not.toHaveURL(/\/organizations/);
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "New Form" }).first(),
    ).toBeVisible();
    await expect(page.getByText("No Forms Yet")).toBeVisible();
    await expect(page.getByText("Ava's workspace")).toBeVisible();
  } finally {
    await deleteOnboardingTestUser(user.id);
  }
});

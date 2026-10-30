import { clerk } from "@clerk/testing/playwright";
import { devices, expect, test } from "@playwright/test";

import {
  createOnboardingTestUser,
  deleteOnboardingTestUser,
} from "../utils/clerk";

const iphone = devices["iPhone 13"];

test.use({
  viewport: iphone.viewport,
  userAgent: iphone.userAgent,
  isMobile: iphone.isMobile,
  hasTouch: iphone.hasTouch,
  deviceScaleFactor: iphone.deviceScaleFactor,
  storageState: { cookies: [], origins: [] },
});

test("sign-in is available on a phone", async ({ page }) => {
  await page.goto("/auth/sign-in");

  await expect(page.locator(".cl-rootBox").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Desktop Only Content" }),
  ).toHaveCount(0);
});

test("a new user on a phone signs in and lands on the desktop handoff", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const { user, email, password } = await createOnboardingTestUser();

  try {
    await page.goto("/auth/register");
    await expect(page.locator(".cl-rootBox").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Desktop Only Content" }),
    ).toHaveCount(0);

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

    await expect(page.getByRole("heading", { name: /You're in!/ })).toBeVisible(
      { timeout: 45_000 },
    );
    await expect(page).toHaveURL(/\/forms/);
    await expect(page).not.toHaveURL(/\/organizations/);
    await expect(
      page.getByRole("heading", { name: "Desktop Only Content" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Email me a desktop link" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Share on WhatsApp" }),
    ).toBeVisible();
  } finally {
    await deleteOnboardingTestUser(user.id);
  }
});

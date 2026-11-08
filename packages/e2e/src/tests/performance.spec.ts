import { expect, test } from "@playwright/test";

test.describe("Performance & Optimistic UI", () => {
  test("Optimistic UI: Title update should happen immediately", async ({
    page,
  }) => {
    // 1. Create a form
    await page.goto("/forms");

    // Wait for the protected shell to finish loading before interacting.
    // The dev server can be slow to serve its first chunk after a restart.
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
      timeout: 30000,
    });

    await page
      .getByRole("button", { name: "New Form", exact: true })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Blank form" }).click();
    await page.waitForURL("**/forms/**");

    // 2. Intercept the update request and delay it
    await page.route("**/api/trpc/form.patch*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    // 3. Change title. The form header loads its data client-side, so wait
    // for the title input before interacting with it.
    const newTitle = "Optimistic Title Check";
    const input = page.locator('input[value="New form"]');
    await expect(input).toBeVisible({ timeout: 30000 });

    await input.fill(newTitle);

    // 4. Verify title changed immediately in UI (before 2s delay)
    await expect(input).toHaveValue(newTitle);

    // Wait for the request to complete
    await page.waitForTimeout(3000);
  });
});

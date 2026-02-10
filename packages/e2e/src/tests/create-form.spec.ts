import { expect, test } from "@playwright/test";

test.describe("Form Creation", () => {
  test("should create a new blank form", async ({ page }) => {
    // Navigate to the forms page (auth state loaded from storageState)
    await page.goto("/forms");

    // Wait for the forms page to load — heading "Forms" is rendered by PageShell
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
      timeout: 15000,
    });

    // Click "New Form" dropdown trigger
    await page.getByRole("button", { name: "New Form" }).click();

    // Select "Blank form" from the dropdown
    await page.getByRole("menuitem", { name: "Blank form" }).click();

    // Wait for redirect to the new form page (e.g. /forms/{id})
    await page.waitForURL("**/forms/**", { timeout: 30000 });

    // Verify the form page loaded — the default form name is "New form"
    await expect(page.getByText("New form")).toBeVisible({ timeout: 10000 });
  });

  test("should open the AI form generation modal", async ({ page }) => {
    // Navigate to the forms page
    await page.goto("/forms");

    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
      timeout: 15000,
    });

    // Click "New Form" dropdown trigger
    await page.getByRole("button", { name: "New Form" }).click();

    // Select "Generate by AI" from the dropdown
    await page.getByRole("menuitem", { name: "Generate by AI" }).click();

    // Verify the AI generation modal opens
    await expect(
      page.getByRole("heading", { name: "Generate Form with AI" }),
    ).toBeVisible({ timeout: 5000 });
  });
});

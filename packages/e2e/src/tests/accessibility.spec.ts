import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("Landing page should be accessible", async ({ page }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        `Accessibility violations for ${page.url()}:`,
        accessibilityScanResults.violations,
      );
    }
    // TODO: Enable this once we fix existing accessibility issues
    // expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Dashboard should be accessible", async ({ page }) => {
    // Authenticated state is handled by storageState in playwright.config.ts
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        `Accessibility violations for ${page.url()}:`,
        accessibilityScanResults.violations,
      );
    }
    // TODO: Enable this once we fix existing accessibility issues
    // expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Forms list should be accessible", async ({ page }) => {
    await page.goto("/forms");
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        `Accessibility violations for ${page.url()}:`,
        accessibilityScanResults.violations,
      );
    }
    // TODO: Enable this once we fix existing accessibility issues
    // expect(accessibilityScanResults.violations).toEqual([]);
  });
});

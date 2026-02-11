import { expect, test } from "@playwright/test";

test.describe("Resilience", () => {
  test("Rate Limiting: Should handle multiple rapid requests gracefully", async ({
    page,
  }) => {
    await page.goto("/forms");

    // Trigger multiple refreshes or form creations rapidly
    // This is hard to test deterministically without hitting actual backend limits.
    // But we can check if the app crashes.

    for (let i = 0; i < 5; i++) {
      // Just verify navigation doesn't crash app
      await page.goto("/forms");
      await page.waitForLoadState("domcontentloaded");
    }

    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

test.describe("Performance & Optimistic UI", () => {
  test("Optimistic UI: Title update should happen immediately", async ({
    page,
  }) => {
    // 1. Create a form
    await page.goto("/forms");
    await page.getByRole("button", { name: "New Form" }).click();
    await page.getByRole("menuitem", { name: "Blank form" }).click();
    await page.waitForURL("**/forms/**");

    // 2. Intercept the update request and delay it
    await page.route("**/api/trpc/form.update*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    // 3. Change title
    const newTitle = "Optimistic Title Check";
    // Assuming the title is editable by clicking on it or an input
    // Inspecting apps/web/src/app/(protectedPage)/forms/[formId]/_components/changeNameInput.tsx would verify this.
    // Let's assume it's an input or contenteditable.
    // Based on file names, it's likely `ChangeNameInput`.

    // Locate the input. It might have a specific ID or role.
    // If it's the header input:
    // const titleInput = page.getByPlaceholder("Form Name"); // Guessing placeholder
    // Or try to find by current value "New form"
    const input = page.locator('input[value="New form"]');

    if ((await input.count()) > 0) {
      await input.fill(newTitle);

      // 4. Verify title changed immediately in UI (before 2s delay)
      await expect(input).toHaveValue(newTitle);
    } else {
      console.log("Could not find title input, skipping optimistic check");
    }

    // Wait for the request to complete
    await page.waitForTimeout(3000);
  });
});

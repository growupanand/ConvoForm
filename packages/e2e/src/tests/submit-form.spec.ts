import { expect, test } from "@playwright/test";

const MOCK_QUESTION = "What is your name?";
const MOCK_ANSWER = "Ada Lovelace";
const END_MESSAGE = "Thank you for filling the form.";

test.describe("Form submission", () => {
  test("creates a blank form, publishes it, and completes public submission with mocked LLM", async ({
    page,
  }) => {
    await page.goto("/forms");

    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: "New Form" }).click();
    await page.getByRole("menuitem", { name: "Blank form" }).click();

    await page.waitForURL(/\/forms\/[^/?#]+/, { timeout: 30000 });
    const formId = new URL(page.url()).pathname.split("/")[2];
    expect(formId).toBeTruthy();

    await expect(page.getByText("New form")).toBeVisible({ timeout: 30000 });

    const publishSwitch = page.locator("#isFormPublished");
    await expect(publishSwitch).toBeVisible({ timeout: 30000 });
    if (!(await publishSwitch.isChecked())) {
      await publishSwitch.click();
      await expect(publishSwitch).toBeChecked({ timeout: 15000 });
    }

    await page.goto(`/view/${formId}`);

    const conversationResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/conversation") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Start" }).click();

    const response = await conversationResponse;
    expect(
      response.ok(),
      `conversation init failed (${response.status()}): ${await response.text()}`,
    ).toBeTruthy();

    await expect(page.getByPlaceholder("Type here...")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByText(MOCK_QUESTION)).toBeVisible({
      timeout: 30000,
    });

    const answerInput = page.getByPlaceholder("Type here...");
    await answerInput.fill(MOCK_ANSWER);
    await answerInput.press("Enter");

    await expect(page.getByRole("heading", { name: END_MESSAGE })).toBeVisible({
      timeout: 30000,
    });
  });
});

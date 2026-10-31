import { type Page, expect, test } from "@playwright/test";

// Runs in the `landing-smoke` project: signed out, desktop viewport (the live
// demo only renders at >= 1024px), and no dependency on the auth `setup` project.

const MOCK_QUESTION = "What is your name?";
const MOCK_ANSWER = "Ada Lovelace";

const waitForConversationPost = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().includes("/api/conversation") &&
      response.request().method() === "POST",
    { timeout: 60000 },
  );

test.describe("Landing page smoke", () => {
  test("loads with the hero heading", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Sign in goes to the Clerk sign-in page", async ({ page }) => {
    await page.goto("/");

    await page
      .locator("header")
      .getByRole("link", { name: /sign in/i })
      .click();

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 30000 });
    await expect(page.locator('input[name="identifier"]')).toBeVisible({
      timeout: 30000,
    });
  });

  test("demo form renders and accepts one message", async ({ page }) => {
    // Two streamed conversation turns against a remote database.
    test.slow();

    await page.goto("/");

    const demo = page.locator(".form-card");
    await expect(
      demo,
      "the live demo did not render; the database needs a published form with id `demo`",
    ).toBeAttached({ timeout: 30000 });
    await demo.scrollIntoViewIfNeeded();

    const conversationStart = waitForConversationPost(page);
    await demo.locator("#welcome-screen").getByRole("button").click();
    const startResponse = await conversationStart;
    expect(
      startResponse.ok(),
      `conversation start failed (${startResponse.status()})`,
    ).toBeTruthy();

    await expect(demo.getByText(MOCK_QUESTION)).toBeVisible({
      timeout: 30000,
    });
    const answerInput = demo.getByPlaceholder("Type here...");
    await expect(answerInput).toBeVisible({ timeout: 30000 });

    const answerResponse = waitForConversationPost(page);
    await answerInput.fill(MOCK_ANSWER);
    await answerInput.press("Enter");
    const submitted = await answerResponse;
    expect(
      submitted.ok(),
      `answer submission failed (${submitted.status()})`,
    ).toBeTruthy();
    await submitted.finished();

    await expect(
      demo.getByRole("heading", { name: "Something went wrong" }),
    ).toHaveCount(0);
  });
});

import type { Page } from "@playwright/test";

export type IntakeField = {
  name: string;
  description: string;
};

async function openFirstFieldEditorSheet(page: Page) {
  await openQuestionsEditor(page);
  const firstFieldRow = page
    .locator('textarea[placeholder="Field description"]')
    .first()
    .locator("xpath=ancestor::div[contains(@class,'relative')][1]");
  await firstFieldRow.getByRole("button").first().click();
  await page.getByText("Edit form field").waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

export async function removeDefaultBlankField(page: Page) {
  await openFirstFieldEditorSheet(page);
  await page.getByRole("button", { name: "Delete field" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete field" })
    .click();
  await page.getByText("Edit form field").waitFor({
    state: "hidden",
    timeout: 30_000,
  });
}

export async function createBlankForm(page: Page) {
  await page.goto("/forms");
  await page.getByRole("heading", { name: "Forms" }).waitFor({
    state: "visible",
    timeout: 30_000,
  });

  await page.getByRole("button", { name: "New Form" }).click();
  await page.getByRole("menuitem", { name: "Blank form" }).click();
  await page.waitForURL(/\/forms\/[^/?#]+/, { timeout: 60_000 });

  const formId = new URL(page.url()).pathname.split("/")[2];
  if (!formId) {
    throw new Error("Could not read form id after creating a blank form.");
  }

  await page
    .getByText("New form")
    .waitFor({ state: "visible", timeout: 60_000 });
  await openQuestionsEditor(page);

  return formId;
}

async function openQuestionsEditor(page: Page) {
  const addQuestion = page.getByRole("button", { name: "Add question" });
  if (await addQuestion.isVisible()) {
    return;
  }

  await page.getByRole("button", { name: "Questions screen" }).click();
  await addQuestion.waitFor({ state: "visible", timeout: 30_000 });
}

export async function addTextField(page: Page, field: IntakeField) {
  await openQuestionsEditor(page);
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByRole("heading", { name: "New question" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });

  await page
    .getByPlaceholder("Field name (e.g. Name, Email, etc.)")
    .fill(field.name);
  await page
    .getByPlaceholder(
      "Information you would like to collect (e.g. Tell me your full name, etc.)",
    )
    .fill(field.description);
  await page.getByRole("button", { name: "save" }).click();

  await page.getByRole("heading", { name: "New question" }).waitFor({
    state: "hidden",
    timeout: 30_000,
  });
  await page
    .getByText(field.description.slice(0, 40), { exact: false })
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
}

export async function publishForm(page: Page) {
  const publishSwitch = page.locator("#isFormPublished");
  await publishSwitch.waitFor({ state: "visible", timeout: 30_000 });
  if (!(await publishSwitch.isChecked())) {
    await publishSwitch.click();
    await publishSwitch.waitFor({ state: "visible", timeout: 15_000 });
  }
}

export async function submitConversationAnswer(page: Page, answer: string) {
  const input = page.getByPlaceholder("Type here...");
  await input.waitFor({ state: "visible", timeout: 120_000 });

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/conversation") &&
      response.request().method() === "POST",
    { timeout: 180_000 },
  );

  await input.fill(answer);
  await input.press("Enter");

  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(
      `Conversation request failed (${response.status()}): ${await response.text()}`,
    );
  }

  const endMessage = page.getByText("Thank you for filling the form.");
  await Promise.race([
    page.getByPlaceholder("Type here...").waitFor({
      state: "visible",
      timeout: 180_000,
    }),
    endMessage.waitFor({ state: "visible", timeout: 180_000 }),
  ]);
}

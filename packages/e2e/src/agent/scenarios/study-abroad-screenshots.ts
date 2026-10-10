import {
  answerUntilField,
  finishPublicConversation,
  prepareConversationDetailForScreenshot,
  waitForBudgetClarification,
  waitForConversationDetailReady,
} from "../helpers/conversationUi";
import {
  addTextField,
  createBlankForm,
  publishForm,
  removeDefaultBlankField,
  submitConversationAnswer,
} from "../helpers/formUi";
import type { AgentScenario } from "../types";

const STUDY_ABROAD_FIELDS = [
  {
    name: "Destination",
    description:
      "Preferred country for study, including any other country they are still considering. Save a short value, not the student's full message.",
  },
  {
    name: "Course",
    description:
      "Subject area and intended level of study. Save a short value, such as the level and subject, not the full message.",
  },
  {
    name: "Intake",
    description:
      "Preferred start month or term, including the year. Save a short value, not the full message.",
  },
  {
    name: "Marks",
    description:
      "Latest qualification, marks or CGPA, and grading scale. Save a short value, not the full message.",
  },
  {
    name: "Budget",
    description:
      "Approximate budget with currency, and whether it covers tuition only or tuition plus living costs. Save a short value, not the full message.",
  },
  {
    name: "Tests",
    description:
      "Relevant English or entrance test, score if taken, or status such as not taken yet. Save a short value, not the full message.",
  },
] as const;

const studyAbroadScreenshots: AgentScenario = async ({ page, shot }) => {
  const formId = await createBlankForm(page);
  await removeDefaultBlankField(page);

  for (const field of STUDY_ABROAD_FIELDS) {
    await addTextField(page, field);
  }

  await publishForm(page);

  await page.goto(`/view/${formId}`);
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByPlaceholder("Type here...").waitFor({
    state: "visible",
    timeout: 120_000,
  });

  await answerUntilField(page, "Budget");
  const budgetQuestion = await page
    .locator("div.whitespace-pre-line.text-2xl")
    .innerText();
  await submitConversationAnswer(page, "20");
  await waitForBudgetClarification(page, budgetQuestion);

  await shot({
    name: "student-conversation",
    out: "apps/web/public/images/use-cases/study-abroad/student-conversation.png",
    mode: "element",
    selector: '[data-marketing-screenshot="public-form"]',
  });

  await finishPublicConversation(page);

  await page.goto(`/forms/${formId}/conversations`);

  const conversationLink = page
    .locator(
      `a[href^="/forms/${formId}/conversations/"]:not([href$="/table"]):not([href$="/conversations"])`,
    )
    .first();
  await conversationLink.waitFor({ state: "visible", timeout: 60_000 });
  await conversationLink.click();
  await page.waitForURL(`**/forms/${formId}/conversations/**`, {
    timeout: 60_000,
  });

  await waitForConversationDetailReady(page);
  await page
    .waitForFunction(
      () => {
        const title = document
          .querySelector(".text-primary.text-xl")
          ?.textContent?.trim()
          .toLowerCase();
        return Boolean(title && title !== "new conversation");
      },
      undefined,
      { timeout: 60_000 },
    )
    .catch(() => {
      console.log(
        "Conversation title stayed generic; capturing the collected fields anyway.",
      );
    });
  await prepareConversationDetailForScreenshot(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await shot({
    name: "collected-response",
    out: "apps/web/public/images/use-cases/study-abroad/collected-response.png",
    mode: "element",
    selector: '[data-marketing-screenshot="conversation-detail"]',
  });
};

export default studyAbroadScreenshots;

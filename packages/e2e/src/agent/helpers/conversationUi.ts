import type { Page } from "@playwright/test";

import { submitConversationAnswer } from "./formUi";

const END_MESSAGE = "Thank you for filling the form.";

export const STUDY_ABROAD_FIELD_ANSWERS: Record<string, string> = {
  Destination:
    "I'm mostly looking at Canada because my cousin is in Toronto, but I haven't ruled out the UK if a scholarship comes through.",
  Course:
    "I want to do a master's in computer science, ideally with some software or AI work. I'm not looking at a bachelor's.",
  Intake:
    "I'd like to start in September 2026. I still have to finish this semester, so a January start would be too soon.",
  Marks:
    "I got 84% in Class 12. That was on the CBSE board, not a university CGPA, so please record it with that scale.",
  Budget:
    "Sorry, I meant about 25 lakh Indian rupees per year, and that amount should cover both the tuition fees and my living costs, not tuition alone.",
  Tests:
    "I haven't taken IELTS yet. I'm planning to book it in the next couple of months, so I don't have a score to share.",
};

const BUDGET_CLARIFICATION = /currency|inr|rupee|tuition|living|lakh|covers/;

export async function answerUntilField(page: Page, fieldName: string) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const label = (await getCurrentFieldLabel(page)).trim();
    if (label.toLowerCase() === fieldName.toLowerCase()) {
      return;
    }
    await submitAnswerForStudyAbroadField(page);
  }

  throw new Error(`Did not reach the ${fieldName} field.`);
}

export async function waitForBudgetClarification(
  page: Page,
  previousQuestion: string,
) {
  await page.waitForFunction(
    ({ previous, patternSource }) => {
      const label = document
        .querySelector(
          ".text-subtle-foreground.font-medium.text-xl.capitalize.text-left",
        )
        ?.textContent?.trim()
        .toLowerCase();
      const question =
        document
          .querySelector("div.whitespace-pre-line.text-2xl")
          ?.textContent?.trim() ?? "";
      const pattern = new RegExp(patternSource, "i");
      return (
        label === "budget" &&
        question.length > 40 &&
        question !== previous &&
        pattern.test(question) &&
        /living|tuition|cover/i.test(question) &&
        !document.querySelector(".animate-ping")
      );
    },
    {
      previous: previousQuestion,
      patternSource: BUDGET_CLARIFICATION.source,
    },
    { timeout: 180_000 },
  );
}

export async function waitForQuestionSettled(page: Page) {
  await page.waitForFunction(
    () => {
      const question =
        document
          .querySelector("div.whitespace-pre-line.text-2xl")
          ?.textContent?.trim() ?? "";
      return question.length > 12 && !document.querySelector(".animate-ping");
    },
    undefined,
    { timeout: 180_000 },
  );
}

const CURRENT_FIELD_LABEL =
  ".text-subtle-foreground.font-medium.text-xl.capitalize.text-left";

export async function getCurrentFieldLabel(page: Page) {
  return page.locator(CURRENT_FIELD_LABEL).first().innerText();
}

export async function submitAnswerForStudyAbroadField(
  page: Page,
  overrides?: Partial<typeof STUDY_ABROAD_FIELD_ANSWERS>,
) {
  await waitForQuestionSettled(page);
  const answers = { ...STUDY_ABROAD_FIELD_ANSWERS, ...overrides };
  const fieldLabel = (await getCurrentFieldLabel(page)).trim();
  const matchKey = Object.keys(answers).find(
    (key) => key.toLowerCase() === fieldLabel.toLowerCase(),
  );

  if (matchKey) {
    await submitConversationAnswer(page, answers[matchKey]);
    return;
  }

  await answerFromQuestionContext(page);
}

export async function answerFromQuestionContext(page: Page) {
  await waitForQuestionSettled(page);
  const question = await page
    .locator("div.whitespace-pre-line.text-2xl")
    .innerText();
  const lower = question.toLowerCase();

  if (
    lower.includes("budget") ||
    lower.includes("currency") ||
    lower.includes("tuition") ||
    lower.includes("living")
  ) {
    await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Budget);
    return;
  }

  if (
    lower.includes("ielts") ||
    lower.includes("toefl") ||
    lower.includes("test") ||
    lower.includes("english")
  ) {
    await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Tests);
    return;
  }

  if (lower.includes("name")) {
    await submitConversationAnswer(page, "Ananya Patel");
    return;
  }

  if (lower.includes("destination") || lower.includes("country")) {
    await submitConversationAnswer(
      page,
      STUDY_ABROAD_FIELD_ANSWERS.Destination,
    );
    return;
  }

  if (lower.includes("course") || lower.includes("study")) {
    await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Course);
    return;
  }

  if (lower.includes("intake") || lower.includes("start")) {
    await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Intake);
    return;
  }

  if (
    lower.includes("mark") ||
    lower.includes("grade") ||
    lower.includes("cgpa")
  ) {
    await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Marks);
    return;
  }

  await submitConversationAnswer(page, STUDY_ABROAD_FIELD_ANSWERS.Budget);
}

const RESPONSE_DETAIL_SELECTOR = "div.grid.gap-10.grid-cols-5";

/** Frames the response card for the marketing screenshot. */
export async function prepareConversationDetailForScreenshot(page: Page) {
  await page.evaluate(() => {
    const sidebar = document.querySelector('[class*="min-w-[450px]"]');
    if (sidebar instanceof HTMLElement) {
      sidebar.style.display = "none";
    }

    const formHeader = document.querySelector(".my-4.mx-6");
    if (formHeader instanceof HTMLElement) {
      formHeader.style.display = "none";
    }

    const metaLabels = new Set([
      "Status",
      "Time taken",
      "Channel",
      "OS",
      "Browser",
      "Device",
      "Country",
      "City",
    ]);
    for (const label of document.querySelectorAll("div.text-xs")) {
      const name = label.textContent?.trim() ?? "";
      if (
        !metaLabels.has(name) ||
        !(label.parentElement instanceof HTMLElement)
      ) {
        continue;
      }
      const value = label.nextElementSibling?.textContent?.trim() ?? "";
      if (value.length === 0 || value === "-") {
        label.parentElement.style.display = "none";
      }
    }

    const transcript = document.querySelector("div.text-base.font-normal");
    const seenUserMessages = new Set<string>();
    for (const block of transcript?.children ?? []) {
      if (!(block instanceof HTMLElement)) {
        continue;
      }
      const userMessage = block.querySelector("p.font-medium");
      const text = userMessage?.textContent?.trim() ?? "";
      if (!text) {
        continue;
      }
      if (seenUserMessages.has(text)) {
        block.style.display = "none";
        continue;
      }
      seenUserMessages.add(text);
    }
  });
}

export async function waitForConversationDetailReady(page: Page) {
  await page.waitForFunction(
    (selector) => {
      const root = document.querySelector(selector);
      if (!root) {
        return false;
      }

      if (root.querySelector(".animate-pulse")) {
        return false;
      }

      const tableRows = root.querySelectorAll("table tbody tr");
      if (tableRows.length === 0) {
        return false;
      }

      let filledValueCells = 0;
      for (const row of tableRows) {
        const cells = row.querySelectorAll("td");
        const valueCell = cells.item(1);
        const value = valueCell?.textContent?.trim() ?? "";
        if (value.length >= 3) {
          filledValueCells += 1;
        }
      }

      const values = Array.from(tableRows).map((row) => {
        const cells = row.querySelectorAll("td");
        return cells.item(1)?.textContent?.trim() ?? "";
      });
      const collected = values.join("\n");
      const transcript = root.textContent ?? "";

      const extractedIsShorterThanChat =
        transcript.includes("cousin is in Toronto") &&
        !/cousin is in Toronto/i.test(collected) &&
        values.every((value) => value.length > 0 && value.length < 80);

      return (
        filledValueCells >= 6 &&
        extractedIsShorterThanChat &&
        /Canada/i.test(collected) &&
        /84/.test(collected) &&
        /lakh|INR|rupee/i.test(collected) &&
        /IELTS|not taken/i.test(collected)
      );
    },
    RESPONSE_DETAIL_SELECTOR,
    { timeout: 120_000 },
  );
}

export async function finishPublicConversation(page: Page) {
  for (let attempt = 0; attempt < 12; attempt++) {
    if (await page.getByText(END_MESSAGE).isVisible()) {
      return;
    }

    const input = page.getByPlaceholder("Type here...");
    if (!(await input.isVisible())) {
      break;
    }

    await submitAnswerForStudyAbroadField(page);
  }

  await page.getByText(END_MESSAGE).waitFor({
    state: "visible",
    timeout: 180_000,
  });
}

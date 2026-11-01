// Shared by the animated "How it works" stage and its static frame so both
// tell the same story with the same fields, answers and values.
export const SCENARIO_SECONDS = 10.8;

export type HowItWorksScenario = {
  /** Label shown above the stage, e.g. "Study abroad enquiry". */
  name: string;
  /** Form title drawn in the static form panel. */
  title: string;
  /** Assistant name drawn in the conversation header. */
  chat: string;
  /** [field key used in the data table, label drawn on the form]. */
  fields: ReadonlyArray<readonly [key: string, formLabel: string]>;
  conversation: ReadonlyArray<{
    question: string;
    answer: string;
    field: number;
    followUp?: string;
    followUpAnswer?: string;
    saved: string;
  }>;
};

export const HOW_IT_WORKS_SCENARIOS: ReadonlyArray<HowItWorksScenario> = [
  {
    name: "Study abroad enquiry",
    title: "Study abroad enquiry",
    chat: "Admissions assistant",
    fields: [
      ["Name", "Full name"],
      ["Country", "Preferred country"],
      ["Intake", "Intake"],
      ["Budget", "Budget"],
    ],
    conversation: [
      {
        question: "What's your budget for studying abroad?",
        answer: "20",
        field: 3,
        followUp: "₹20 lakh per year, or in total?",
        followUpAnswer: "per year",
        saved: "₹20 lakh / year",
      },
      {
        question: "Which country are you considering?",
        answer: "maybe canada",
        field: 1,
        saved: "Canada",
      },
      {
        question: "When would you like to start?",
        answer: "sept next yr",
        field: 2,
        saved: "Sep 2027",
      },
      {
        question: "Lastly, your name?",
        answer: "priya s",
        field: 0,
        saved: "Priya S.",
      },
    ],
  },
  {
    name: "Job application",
    title: "Job application",
    chat: "Hiring assistant",
    fields: [
      ["Name", "Full name"],
      ["Role", "Role applying for"],
      ["Experience", "Years of experience"],
      ["Notice", "Notice period"],
    ],
    conversation: [
      {
        question: "How many years of experience do you have?",
        answer: "around 3-4",
        field: 2,
        followUp: "Closer to 3 or 4?",
        followUpAnswer: "4, mostly React",
        saved: "4 yrs (React)",
      },
      {
        question: "Nice! Which role are you applying for?",
        answer: "frontend",
        field: 1,
        saved: "Frontend Developer",
      },
      {
        question: "And your notice period?",
        answer: "asap",
        field: 3,
        saved: "Immediate",
      },
      {
        question: "Lastly, your full name?",
        answer: "rahul mehta",
        field: 0,
        saved: "Rahul Mehta",
      },
    ],
  },
  {
    name: "Event enquiry",
    title: "Event enquiry",
    chat: "Events assistant",
    fields: [
      ["Name", "Your name"],
      ["Guests", "Number of guests"],
      ["Date", "Event date"],
      ["City", "City"],
    ],
    conversation: [
      {
        question: "How many guests are you expecting?",
        answer: "100ish",
        field: 1,
        followUp: "Around 100, or could it go higher?",
        followUpAnswer: "max 120",
        saved: "100–120",
      },
      {
        question: "Which date are you planning for?",
        answer: "14 feb",
        field: 2,
        saved: "14 Feb 2027",
      },
      {
        question: "And the city?",
        answer: "blr",
        field: 3,
        saved: "Bengaluru",
      },
      {
        question: "Great, your name?",
        answer: "ankit",
        field: 0,
        saved: "Ankit",
      },
    ],
  },
] as const;

export function savedValueForField(
  scenario: HowItWorksScenario,
  fieldIndex: number,
) {
  return scenario.conversation.find((step) => step.field === fieldIndex)?.saved;
}

export function getScenario(index: number): HowItWorksScenario {
  const scenario = HOW_IT_WORKS_SCENARIOS[index];
  if (!scenario) throw new Error(`Missing How-it-works scenario ${index}`);
  return scenario;
}

export type ConversationEvent =
  | {
      kind: "ai";
      text: string;
      /** When the typing dots appear. */
      dotsAt: number;
      /** When the full question is written. */
      at: number;
      field: number;
      followUp?: boolean;
    }
  | {
      kind: "user";
      text: string;
      at: number;
      end: number;
      /** When the vague underline is drawn. */
      vagueAt?: number;
    };

export type SavedValue = {
  field: number;
  fill: number;
  value: string;
  from: ConversationEvent & { kind: "user" };
};

export type ScenarioSchedule = {
  events: ConversationEvent[];
  saves: SavedValue[];
  asks: Array<{ field: number; at: number }>;
  end: number;
};

/**
 * Turns a scenario into the timeline used by the line-art animation. The first
 * answer is typed slowly and gets a follow-up; later turns move faster.
 */
export function scheduleScenario(
  scenario: HowItWorksScenario,
): ScenarioSchedule {
  const events: ConversationEvent[] = [];
  const saves: SavedValue[] = [];
  const asks: Array<{ field: number; at: number }> = [];

  let cursor = 1.2;

  for (const [index, step] of scenario.conversation.entries()) {
    const fast = index > 0;
    const typeDuration = (text: string) =>
      fast
        ? Math.min(0.4, 0.1 + text.length * 0.026)
        : Math.min(0.75, 0.12 + text.length * 0.035);
    const questionDelay = fast ? 0.4 : 0.5;
    const readDelay = fast ? 0.22 : 0.5;
    const pause = fast ? 0.15 : 0.4;

    events.push({
      kind: "ai",
      text: step.question,
      dotsAt: cursor,
      at: cursor + questionDelay,
      field: step.field,
    });
    asks.push({ field: step.field, at: cursor });
    cursor += questionDelay + readDelay;

    let answer: ConversationEvent & { kind: "user" } = {
      kind: "user",
      text: step.answer,
      at: cursor,
      end: cursor + typeDuration(step.answer),
    };
    events.push(answer);
    cursor += typeDuration(step.answer) + pause;

    if (step.followUp && step.followUpAnswer) {
      answer.vagueAt = cursor;
      events.push({
        kind: "ai",
        text: step.followUp,
        dotsAt: cursor,
        at: cursor + 0.45,
        field: step.field,
        followUp: true,
      });
      cursor += 0.45 + 0.65;

      answer = {
        kind: "user",
        text: step.followUpAnswer,
        at: cursor,
        end: cursor + typeDuration(step.followUpAnswer),
      };
      events.push(answer);
      cursor += typeDuration(step.followUpAnswer) + 0.3;
    }

    saves.push({
      field: step.field,
      fill: cursor + 0.15,
      value: step.saved,
      from: answer,
    });
    cursor += fast ? 0.12 : 0.25;
  }

  return { events, saves, asks, end: cursor + 0.15 };
}

export type BeforeAfterId = "study" | "job";

export type BeforeAfterMessage = {
  kind: "ai" | "user" | "followUp";
  text: string;
  vague?: boolean;
};

export type BeforeAfterValue = {
  key: string;
  value: string;
  highlighted?: boolean;
};

export type BeforeAfterScenario = {
  id: BeforeAfterId;
  tab: string;
  panelTitle: string;
  fieldLabel: string;
  typed: string;
  staticNote: string;
  saved: string;
  messages: ReadonlyArray<BeforeAfterMessage>;
  values: ReadonlyArray<BeforeAfterValue>;
};

export const BEFORE_AFTER_TABS: ReadonlyArray<{
  id: BeforeAfterId;
  label: string;
}> = [
  { id: "study", label: "Study abroad" },
  { id: "job", label: "Job application" },
];

export const BEFORE_AFTER_SCENARIOS: Record<
  BeforeAfterId,
  BeforeAfterScenario
> = {
  study: {
    id: "study",
    tab: "Study abroad",
    panelTitle: "Study abroad enquiry",
    fieldLabel: "Budget *",
    typed: "20",
    staticNote: "Your team still has to call to find out what it means.",
    saved: "₹20 lakh per year",
    messages: [
      { kind: "ai", text: "What's your budget for studying abroad?" },
      { kind: "user", text: "20", vague: true },
      { kind: "followUp", text: "₹20 lakh per year, or in total?" },
      { kind: "user", text: "per year" },
    ],
    values: [
      { key: "Name", value: "Priya S." },
      { key: "Destination", value: "Canada" },
      { key: "Course", value: "MSc Data Science" },
      { key: "Intake", value: "Sep 2027" },
      { key: "Budget", value: "₹20 lakh per year", highlighted: true },
    ],
  },
  job: {
    id: "job",
    tab: "Job application",
    panelTitle: "Job application",
    fieldLabel: "Years of experience *",
    typed: "3-4",
    staticNote: "Your team still has to call to find out what it means.",
    saved: "4 yrs (React)",
    messages: [
      { kind: "ai", text: "Years of experience?" },
      { kind: "user", text: "3-4", vague: true },
      { kind: "followUp", text: "Closer to 3 or 4?" },
      { kind: "user", text: "4, mostly React" },
    ],
    values: [
      { key: "Name", value: "Rahul Mehta" },
      { key: "Role", value: "Frontend Developer" },
      { key: "Experience", value: "4 yrs (React)", highlighted: true },
      { key: "Notice", value: "Immediate" },
    ],
  },
};

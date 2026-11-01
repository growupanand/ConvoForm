// Shared by the animated hero and its static frames so every state tells the
// same story, with the same labels, answers and timing.
export const HERO_LOOP_SECONDS = 8;

// The form is fully assembled here. The server render, the pre-hydration render
// and the first animation frame all use this moment.
export const HERO_FORM_HOLD_SECONDS = 0.95;

export const HERO_SCENARIOS = [
  {
    title: "Enquiry form",
    fields: ["Full name", "Email", "Budget", "Notes"],
    requiredIndex: 2,
    messages: [
      { kind: "ai", text: "Hi! What should I call you?" },
      { kind: "user", text: "Priya" },
      { kind: "ai", text: "What's your budget?" },
      { kind: "user", text: "around 20" },
      { kind: "followUp", text: "₹20 lakh per year, or in total?" },
      { kind: "user", text: "per year" },
    ],
    chips: [
      { messageIndex: 1, label: "Name", value: "Priya" },
      { messageIndex: 5, label: "Budget", value: "₹20 lakh / year" },
    ],
  },
  {
    title: "Job application",
    fields: ["Full name", "Email", "Experience", "Notes"],
    requiredIndex: 2,
    messages: [
      { kind: "ai", text: "Hi! What should I call you?" },
      { kind: "user", text: "Alex" },
      { kind: "ai", text: "How many years of experience?" },
      { kind: "user", text: "3-4" },
      { kind: "followUp", text: "Closer to 3 or 4?" },
      { kind: "user", text: "4, mostly React" },
    ],
    chips: [
      { messageIndex: 1, label: "Name", value: "Alex" },
      { messageIndex: 5, label: "Experience", value: "4 yrs (React)" },
    ],
  },
] as const;

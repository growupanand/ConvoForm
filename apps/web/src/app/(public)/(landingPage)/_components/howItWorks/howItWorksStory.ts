// The How it works example data, shared by the live scene and its still frames.

export const HOW_PROMPT = "Enquiry form for students planning to study abroad";

export const HOW_FIELDS = [
  "Full name",
  "Preferred country",
  "Budget",
  "Intake",
] as const;

/** Short keys for the response card, in the same order as HOW_FIELDS. */
export const HOW_KEYS = ["Name", "Country", "Budget", "Intake"] as const;

/** The clean response, in the same order as HOW_FIELDS. */
export const HOW_SAVED = [
  "Priya S.",
  "Canada",
  "₹20 lakh / year",
  "Sep 2027",
] as const;

export const HOW_LINK = "convoform.com/enquiry";

export type HowMessage = {
  from: "me" | "them";
  text: string;
  /** The field the chat is asking for, highlighted in the builder. */
  ask?: number;
  /** The field this answer fills in the response. */
  save?: number;
  followUp?: boolean;
};

export const HOW_CHAT: readonly HowMessage[] = [
  { from: "them", text: "Which country are you considering?", ask: 1 },
  { from: "me", text: "maybe canada", save: 1 },
  {
    from: "them",
    text: "What's your budget for studying abroad?",
    ask: 2,
  },
  { from: "me", text: "20" },
  {
    from: "them",
    text: "₹20 lakh per year, or in total?",
    ask: 2,
    followUp: true,
  },
  { from: "me", text: "per year", save: 2 },
  { from: "them", text: "When would you like to start?", ask: 3 },
  { from: "me", text: "sept next yr", save: 3 },
  { from: "them", text: "Lastly, your name?", ask: 0 },
  { from: "me", text: "priya s", save: 0 },
] as const;

export const HOW_RAIL = {
  wide: ["Design your form", "Share the link", "Review clean answers"],
  compact: ["Design", "Share", "Review"],
} as const;

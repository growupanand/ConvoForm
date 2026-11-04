// The hero's example data, shared by the animated scene and its static frames
// so the first frame, the poster and the live loop never drift apart.

export const HERO_TITLE = "Study abroad enquiry";

export const HERO_FIELDS = [
  "Full name",
  "Preferred country",
  "Budget",
  "Intake",
] as const;

/** The clean record, in the same order as HERO_FIELDS. */
export const HERO_VALUES = [
  "Priya S.",
  "Canada",
  "₹20 lakh / year",
  "Sep 2027",
] as const;

/** Index of the field that is empty at the start and complains on Submit. */
export const HERO_BUDGET = 2;

export type HeroMessage = {
  from: "me" | "them";
  text: string;
  followUp?: boolean;
};

export const HERO_MESSAGES: readonly HeroMessage[] = [
  { from: "them", text: "Hi! Which country are you planning to study in?" },
  { from: "me", text: "Canada" },
  { from: "them", text: "Great. What's your budget?" },
  { from: "me", text: "Around 20 lakh" },
  {
    from: "them",
    text: "Is that ₹20 lakh per year, or for the whole course?",
    followUp: true,
  },
  { from: "me", text: "Per year, including living costs" },
] as const;

import type { AnswerSufficiencyInput } from "../types";

export type DecisionEvalSample = AnswerSufficiencyInput & {
  id: string;
  expectedSufficient: boolean;
};

/**
 * Labelled samples for the local decision eval.
 *
 * Add rows here to grow the fixture to 50+; each row is one field question and
 * one reply, with the expected decision. Keep IDs short and stable so metric
 * output stays comparable between runs.
 */
export const decisionEvalSamples: DecisionEvalSample[] = [
  {
    id: "clear-short",
    fieldQuestion: "Which city do you live in?",
    fieldType: "text",
    answer: "Berlin",
    expectedSufficient: true,
  },
  {
    id: "clear-long",
    fieldQuestion: "Describe your work experience.",
    fieldType: "text",
    answer:
      "I spent five years as a nurse in a children's hospital, mostly in the emergency ward.",
    expectedSufficient: true,
  },
  {
    id: "vague-ok",
    fieldQuestion: "What is your current job title?",
    fieldType: "text",
    answer: "ok",
    expectedSufficient: false,
  },
  {
    id: "vague-haan",
    fieldQuestion: "What is the highest degree you have completed?",
    fieldType: "text",
    answer: "haan",
    expectedSufficient: false,
    recentTurns: [
      {
        role: "assistant",
        content: "What is the highest degree you have completed?",
      },
    ],
  },
  {
    id: "hinglish-clear",
    fieldQuestion: "Which city do you live in?",
    fieldType: "text",
    answer: "Main Bengaluru mein rehta hoon, HSR Layout mein.",
    expectedSufficient: true,
    recentTurns: [
      {
        role: "assistant",
        content: "Which city do you live in?",
      },
    ],
  },
  {
    id: "junk",
    fieldQuestion: "Describe your work experience.",
    fieldType: "text",
    answer: "asdfghjkl",
    expectedSufficient: false,
  },
  {
    id: "emoji-only",
    fieldQuestion: "What are your hobbies?",
    fieldType: "text",
    answer: "👍",
    expectedSufficient: false,
  },
  {
    id: "no-answer",
    fieldQuestion: "Why do you want to join this program?",
    fieldType: "text",
    answer: "I don't know",
    expectedSufficient: false,
  },
  {
    id: "hinglish-ielts",
    fieldQuestion: "What is your IELTS score?",
    fieldType: "text",
    answer: "IELTS mein 7 band aaya",
    expectedSufficient: true,
  },
  {
    id: "hinglish-budget",
    fieldQuestion: "What is your budget for studying abroad?",
    fieldType: "text",
    answer: "budget around 25 lakh",
    expectedSufficient: true,
  },
];

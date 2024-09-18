export const FORM_SECTIONS_ENUMS = {
  landingScreen: "landing-screen" as const,
  questionsScreen: "questions-screen" as const,
  endingScreen: "ending-screen" as const,
  defaultScreen: "default-screen" as const,
};

export type FormSections =
  (typeof FORM_SECTIONS_ENUMS)[keyof typeof FORM_SECTIONS_ENUMS];

export const FORM_SECTIONS_ENUMS = {
  landingScreen: "landing-screen" as const,
  questionsScreen: "questions-screen" as const,
  endingScreen: "ending-screen" as const,
  defaultScreen: "default-screen" as const,
};

export const FORM_SECTIONS_ENUMS_VALUES = Object.values(FORM_SECTIONS_ENUMS);

export type FormSections =
  (typeof FORM_SECTIONS_ENUMS)[keyof typeof FORM_SECTIONS_ENUMS];

export const DEFAULT_FORM_DESIGN = {
  backgroundColor: "#F9FAFB",
  fontColor: "#020817",
};

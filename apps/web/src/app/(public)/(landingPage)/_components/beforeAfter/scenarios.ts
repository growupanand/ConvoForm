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

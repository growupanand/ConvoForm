export const defaultErrorMessage = "Something went wrong.";

export const OPEN_AI_MODEL = process.env.OPEN_AI_MODEL ?? "gpt-3.5-turbo-1106";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

export const CONVERSATION_START_MESSAGE = "Hello, I want to fill the form";

export const planExceedSubmissionMessage =
  "You have reached the limit of 5 submissions";

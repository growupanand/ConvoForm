import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export const AI_MODEL: LanguageModel = openai("gpt-4o-mini");

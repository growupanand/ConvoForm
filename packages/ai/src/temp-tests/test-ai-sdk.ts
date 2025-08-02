import { openai } from "@ai-sdk/openai";
import { fieldConfigurationSchema } from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod";

const { object } = await generateObject({
  model: openai("gpt-4o-mini"),
  schema: z.object({
    fieldConfigurations: fieldConfigurationSchema.array(),
  }),
  prompt: "Generate a job application form. Only generate maximum 5 fields.",
});

console.log(JSON.stringify(object, null, 2));

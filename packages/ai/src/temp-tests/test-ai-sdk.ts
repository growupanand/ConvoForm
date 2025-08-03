import type { CollectedData, Transcript } from "@convoform/db/src/schema";
import { extractFieldAnswer } from "../conversationV5";

console.log("\n\n===== Starting test-ai-sdk.ts =====\n\n");

const sampleFormOverview =
  "This is a feedback for website convoform.com, I want to know about the user details and there feedback about the product.";
const sampleTrancript: Transcript[] = [
  { role: "user", content: "Hi" },
  // { "role": "assistant", "content": "Hello! To start, may I have your email address?", "fieldName": "email" },
  // { "role": "user", "content": "sadfsdfsdf@sddfsdf.com" },
];

const sampleEmailField: CollectedData = {
  fieldName: "email",
  fieldDescription: "Your email address",
  fieldValue: null,
  fieldConfiguration: { inputType: "text", inputConfiguration: {} },
};

const result = await extractFieldAnswer({
  formOverview: sampleFormOverview,
  transcript: sampleTrancript,
  currentField: sampleEmailField,
});

console.log("Result: ", result);

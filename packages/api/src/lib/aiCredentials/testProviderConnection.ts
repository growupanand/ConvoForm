/**
 * Indirection so router tests can replace the real provider call without
 * mocking the whole `@convoform/ai` package.
 */
export {
  testAiProviderConnection,
  type AiProviderConnectionTestInput,
  type AiProviderConnectionTestResult,
  type AiProviderTestErrorCode,
} from "@convoform/ai";

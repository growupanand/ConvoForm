import {
  type AiProviderConnectionTestInput,
  type AiProviderConnectionTestResult,
  testAiProviderConnection as testProviderConnection,
} from "@convoform/ai";

export type {
  AiProviderConnectionTestInput,
  AiProviderConnectionTestResult,
  AiProviderTestErrorCode,
} from "@convoform/ai";

/**
 * Local wrapper so router tests can replace the real provider call without
 * mocking the whole `@convoform/ai` package (Bun mocks are process-wide).
 */
export function testAiProviderConnection(
  input: AiProviderConnectionTestInput,
): Promise<AiProviderConnectionTestResult> {
  return testProviderConnection(input);
}

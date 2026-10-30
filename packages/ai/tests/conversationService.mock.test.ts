import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { CoreConversation } from "@convoform/db/src/schema";
import { inputTypeEnum } from "@convoform/db/src/schema";
import { E2E_MOCK_QUESTION } from "../src/e2eMockLanguageModel";
import { ConversationManager } from "../src/managers/conversationManager";
import { ConversationService } from "../src/services/conversationService";

const RATING_FIELD_ID = "field_rating_1";

function createMockForm(overrides: Partial<CoreConversation["form"]> = {}) {
  return {
    id: "form_test_abc",
    name: "Feedback Form",
    overview: "Collect experience ratings",
    welcomeScreenTitle: "Welcome",
    welcomeScreenMessage: "Please share your feedback",
    welcomeScreenCTALabel: "Start",
    isPublished: true,
    organizationId: "org_test_123",
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    showOrganizationName: false,
    showOrganizationLogo: false,
    showCustomEndScreenMessage: false,
    customEndScreenMessage: null,
    formFieldsOrders: [RATING_FIELD_ID],
    endScreenCTAUrl: null,
    endScreenCTALabel: null,
    ...overrides,
  };
}

function createRatingConversation(
  overrides: Partial<CoreConversation> = {},
): CoreConversation {
  return {
    id: "conv_test_123",
    name: "Test Conversation",
    transcript: [
      {
        role: "assistant",
        content: "On a scale of 1 to 5, how would you rate your experience?",
      },
    ],
    formFieldResponses: [
      {
        id: RATING_FIELD_ID,
        fieldName: "Experience rating",
        fieldDescription: "Rate your experience from 1 to 5",
        fieldConfiguration: {
          inputType: inputTypeEnum.enum.rating,
          inputConfiguration: { maxRating: 5 },
        },
        fieldValue: null,
      },
    ],
    formOverview: "Feedback form",
    formId: "form_test_abc",
    organizationId: "org_test_123",
    finishedAt: null,
    isInProgress: true,
    metaData: {},
    currentFieldId: RATING_FIELD_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    channelType: null,
    channelSenderId: null,
    form: createMockForm(),
    ...overrides,
  } as CoreConversation;
}

async function consumeTextDeltas(
  stream: AsyncIterable<unknown>,
): Promise<string> {
  let text = "";

  for await (const chunk of stream) {
    if (
      typeof chunk === "object" &&
      chunk !== null &&
      "type" in chunk &&
      (chunk as { type: string }).type === "text-delta" &&
      "delta" in chunk
    ) {
      text += (chunk as { delta: string }).delta;
    }
  }

  return text;
}

describe("ConversationService rating validation", () => {
  const previousE2eMock = process.env.E2E_MOCK_LLM;

  beforeEach(() => {
    process.env.E2E_MOCK_LLM = "1";
  });

  afterEach(() => {
    if (previousE2eMock === undefined) {
      process.env.E2E_MOCK_LLM = undefined;
    } else {
      process.env.E2E_MOCK_LLM = previousE2eMock;
    }
  });

  it('re-asks when "6" is submitted for a 1–5 rating', async () => {
    const conversation = createRatingConversation();
    const manager = new ConversationManager({ conversation });
    const service = new ConversationService(manager, "stream_test_1");

    const stream = await service.process("6", RATING_FIELD_ID);
    const followUpText = await consumeTextDeltas(stream);

    const updated = manager.getConversation();
    const ratingField = updated.formFieldResponses[0];

    expect(ratingField?.fieldValue).toBeNull();
    expect(updated.finishedAt).toBeNull();
    expect(updated.isInProgress).toBe(true);
    expect(updated.transcript.some((entry) => entry.content === "6")).toBe(
      true,
    );
    expect(followUpText).toBe(E2E_MOCK_QUESTION);
    expect(
      updated.transcript.some((entry) => entry.content === E2E_MOCK_QUESTION),
    ).toBe(true);
    expect(
      updated.transcript.some((entry) =>
        entry.content.includes("Form completed successfully"),
      ),
    ).toBe(false);
  });

  it('saves normalized "four" and completes a single-field rating form', async () => {
    const conversation = createRatingConversation();
    const manager = new ConversationManager({ conversation });
    const service = new ConversationService(manager, "stream_test_2");

    const stream = await service.process("four", RATING_FIELD_ID);
    await consumeTextDeltas(stream);

    const updated = manager.getConversation();
    const ratingField = updated.formFieldResponses[0];

    expect(ratingField?.fieldValue).toBe("4");
    expect(updated.finishedAt).not.toBeNull();
    expect(updated.isInProgress).toBe(false);
  });
});

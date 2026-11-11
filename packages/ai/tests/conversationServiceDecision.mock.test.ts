import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type {
  AnswerCheckProvider,
  CoreConversation,
} from "@convoform/db/src/schema";
import type { AnswerSufficiencyCheckParams } from "../src/decision";
import { E2E_MOCK_QUESTION } from "../src/e2eMockLanguageModel";
import { ConversationManager } from "../src/managers/conversationManager";
import { ConversationService } from "../src/services/conversationService";

const TEXT_FIELD_ID = "field_text_1";

function createMockForm(
  overrides: Partial<CoreConversation["form"]> = {},
): CoreConversation["form"] {
  return {
    id: "form_test_abc",
    name: "Application Form",
    overview: "Collect applicant details",
    welcomeScreenTitle: "Welcome",
    welcomeScreenMessage: "Tell us about yourself",
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
    formFieldsOrders: [TEXT_FIELD_ID],
    endScreenCTAUrl: null,
    endScreenCTALabel: null,
    answerCheckProvider: "cloudflare-clef",
    ...overrides,
  } as CoreConversation["form"];
}

function createTextConversation(
  provider: AnswerCheckProvider = "cloudflare-clef",
): CoreConversation {
  return {
    id: "conv_test_123",
    name: "Test Conversation",
    transcript: [{ role: "assistant", content: "What is your name?" }],
    formFieldResponses: [
      {
        id: TEXT_FIELD_ID,
        fieldName: "Full name",
        fieldDescription: "Your full name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
        fieldValue: null,
      },
    ],
    formOverview: "Application form",
    formId: "form_test_abc",
    organizationId: "org_test_123",
    finishedAt: null,
    isInProgress: true,
    metaData: {},
    currentFieldId: TEXT_FIELD_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    channelType: null,
    channelSenderId: null,
    form: createMockForm({ answerCheckProvider: provider }),
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

describe("ConversationService answer sufficiency check", () => {
  const previousE2eMock = process.env.E2E_MOCK_LLM;

  beforeEach(() => {
    process.env.E2E_MOCK_LLM = "1";
  });

  afterEach(() => {
    if (previousE2eMock === undefined) {
      process.env.E2E_MOCK_LLM = "";
    } else {
      process.env.E2E_MOCK_LLM = previousE2eMock;
    }
  });

  it("asks a follow-up without extracting when the reply is insufficient", async () => {
    const conversation = createTextConversation();
    const manager = new ConversationManager({ conversation });
    const calls: AnswerSufficiencyCheckParams[] = [];
    const service = new ConversationService(
      manager,
      "stream_test_1",
      undefined,
      {
        checkAnswerSufficiency: async (params) => {
          calls.push(params);
          return {
            sufficient: false,
            confidence: 0.15,
            provider: "cloudflare-clef",
            model: "@cf/cloudflare/clef-flash",
            latencyMs: 12,
          };
        },
      },
    );

    const stream = await service.process("ok", TEXT_FIELD_ID);
    const followUpText = await consumeTextDeltas(stream);

    const updated = manager.getConversation();
    expect(updated.formFieldResponses[0]?.fieldValue).toBeNull();
    expect(updated.finishedAt).toBeNull();
    expect(updated.isInProgress).toBe(true);
    expect(updated.transcript.some((entry) => entry.content === "ok")).toBe(
      true,
    );
    expect(followUpText).toBe(E2E_MOCK_QUESTION);
    expect(
      updated.transcript.some((entry) => entry.content === E2E_MOCK_QUESTION),
    ).toBe(true);

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      fieldQuestion: "What is your name?",
      fieldType: "text",
      answer: "ok",
      provider: "cloudflare-clef",
      fieldId: TEXT_FIELD_ID,
    });
    expect(calls[0]?.recentTurns).toEqual([
      { role: "assistant", content: "What is your name?" },
    ]);
  });

  it("continues the extraction flow when the check falls back", async () => {
    const conversation = createTextConversation();
    const manager = new ConversationManager({ conversation });
    const service = new ConversationService(
      manager,
      "stream_test_2",
      undefined,
      {
        checkAnswerSufficiency: async () => ({
          sufficient: true,
          confidence: 0,
          provider: "cloudflare-clef",
          model: "@cf/cloudflare/clef-flash",
          latencyMs: 1500,
          fallbackReason: "timeout",
        }),
      },
    );

    const stream = await service.process("Ada Lovelace", TEXT_FIELD_ID);
    await consumeTextDeltas(stream);

    const updated = manager.getConversation();
    expect(updated.formFieldResponses[0]?.fieldValue).toBe("Ada Lovelace");
    expect(updated.finishedAt).not.toBeNull();
    expect(updated.isInProgress).toBe(false);
  });

  it("extracts and saves when the reply is sufficient", async () => {
    const conversation = createTextConversation();
    const manager = new ConversationManager({ conversation });
    const service = new ConversationService(
      manager,
      "stream_test_3",
      undefined,
      {
        checkAnswerSufficiency: async () => ({
          sufficient: true,
          confidence: 0.92,
          provider: "cloudflare-clef",
          model: "@cf/cloudflare/clef-flash",
          latencyMs: 20,
        }),
      },
    );

    const stream = await service.process("Ada Lovelace", TEXT_FIELD_ID);
    await consumeTextDeltas(stream);

    expect(manager.getConversation().formFieldResponses[0]?.fieldValue).toBe(
      "Ada Lovelace",
    );
  });

  it("does not check structural fields that save exact values", async () => {
    const conversation = createTextConversation();
    conversation.formFieldResponses = [
      {
        id: TEXT_FIELD_ID,
        fieldName: "Rating",
        fieldDescription: "Rate your experience",
        fieldConfiguration: {
          inputType: "rating",
          inputConfiguration: { maxRating: 5 },
        },
        fieldValue: null,
      },
    ];
    const manager = new ConversationManager({ conversation });
    let calls = 0;
    const service = new ConversationService(
      manager,
      "stream_test_6",
      undefined,
      {
        checkAnswerSufficiency: async () => {
          calls += 1;
          return {
            sufficient: false,
            confidence: 0,
            provider: "cloudflare-clef",
            model: "@cf/cloudflare/clef-flash",
            latencyMs: 0,
          };
        },
      },
    );

    const stream = await service.process("4", TEXT_FIELD_ID);
    await consumeTextDeltas(stream);

    expect(calls).toBe(0);
    expect(manager.getConversation().formFieldResponses[0]?.fieldValue).toBe(
      "4",
    );
  });

  it("skips the check entirely when the form opted out", async () => {
    const conversation = createTextConversation("none");
    const manager = new ConversationManager({ conversation });
    let calls = 0;
    const service = new ConversationService(
      manager,
      "stream_test_4",
      undefined,
      {
        checkAnswerSufficiency: async () => {
          calls += 1;
          return {
            sufficient: false,
            confidence: 0,
            provider: "none",
            model: "none",
            latencyMs: 0,
          };
        },
      },
    );

    const stream = await service.process("Ada Lovelace", TEXT_FIELD_ID);
    await consumeTextDeltas(stream);

    expect(calls).toBe(0);
    expect(manager.getConversation().formFieldResponses[0]?.fieldValue).toBe(
      "Ada Lovelace",
    );
  });

  it("defaults to Cloudflare Clef when the form has no provider stored", async () => {
    const conversation = createTextConversation();
    conversation.form = createMockForm({ answerCheckProvider: undefined });
    const manager = new ConversationManager({ conversation });
    const calls: AnswerSufficiencyCheckParams[] = [];
    const service = new ConversationService(
      manager,
      "stream_test_5",
      undefined,
      {
        checkAnswerSufficiency: async (params) => {
          calls.push(params);
          return {
            sufficient: true,
            confidence: 0.9,
            provider: "cloudflare-clef",
            model: "@cf/cloudflare/clef-flash",
            latencyMs: 10,
          };
        },
      },
    );

    const stream = await service.process("Ada Lovelace", TEXT_FIELD_ID);
    await consumeTextDeltas(stream);

    expect(calls[0]?.provider).toBe("cloudflare-clef");
  });
});

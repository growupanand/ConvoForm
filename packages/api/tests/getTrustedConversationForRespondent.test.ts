import { describe, expect, it, mock } from "bun:test";
import { DEFAULT_FORM_LABEL_SETTINGS } from "@convoform/db/src/schema/forms/labelSettings";
import type { ConversationAccessError } from "../src/actions/conversation/getTrustedConversationForRespondent";
import { getTrustedConversationForRespondent } from "../src/actions/conversation/getTrustedConversationForRespondent";

const formField = {
  id: "field_1",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  fieldName: "Name",
  fieldDescription: "Your name",
  fieldConfiguration: { inputType: "text" as const, inputConfiguration: {} },
  formId: "form_db",
};

const formRow = {
  id: "form_db",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  name: "Contact form",
  overview: "Tell us about yourself",
  welcomeScreenTitle: "Welcome",
  welcomeScreenMessage: "Fill this in",
  welcomeScreenCTALabel: "Start",
  isPublished: true,
  publishedAt: new Date("2026-01-01T00:00:00.000Z"),
  userId: "owner_user",
  organizationId: "org_db",
  isAIGenerated: false,
  showOrganizationName: false,
  organizationName: null,
  showOrganizationLogo: false,
  organizationLogoUrl: null,
  showCustomEndScreenMessage: false,
  customEndScreenMessage: null,
  formFieldsOrders: ["field_1"],
  endScreenCTAUrl: null,
  endScreenCTALabel: null,
  googleFormId: null,
  answerCheckProvider: "none" as const,
  labelSettings: DEFAULT_FORM_LABEL_SETTINGS,
  formFields: [formField],
};

function buildConversation(overrides: Record<string, unknown> = {}) {
  return {
    id: "conv_1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    name: "New Conversation",
    transcript: [],
    formFieldResponses: [
      {
        id: "field_1",
        fieldName: "Name",
        fieldDescription: "Your name",
        fieldConfiguration: {
          inputType: "text" as const,
          inputConfiguration: {},
        },
        fieldValue: null,
      },
    ],
    formOverview: "Tell us about yourself",
    formId: "form_db",
    organizationId: "org_db",
    finishedAt: null,
    isInProgress: true,
    metaData: {},
    currentFieldId: "field_1",
    channelType: null,
    channelSenderId: null,
    ...overrides,
  };
}

function createDb({
  conversation = buildConversation(),
  form = formRow,
  isMember = false,
}: {
  conversation?: ReturnType<typeof buildConversation> | null;
  form?: typeof formRow | null;
  isMember?: boolean;
} = {}) {
  return {
    query: {
      conversation: {
        findFirst: mock(() => Promise.resolve(conversation)),
      },
      form: {
        findFirst: mock(() => Promise.resolve(form)),
      },
      organizationMember: {
        findFirst: mock(() =>
          Promise.resolve(isMember ? { id: "member_1" } : undefined),
        ),
      },
    },
  } as any;
}

describe("getTrustedConversationForRespondent", () => {
  it("uses the database organization, form and current field", async () => {
    const db = createDb();

    const result = await getTrustedConversationForRespondent(
      {
        conversationId: "conv_1",
        formId: "form_db",
        currentFieldId: "field_1",
        // Simulate a tampered body: these values must be ignored.
        organizationId: "org_attacker",
        isOwnerPreview: true,
      } as any,
      null,
      { db },
    );

    expect(result.conversation.organizationId).toBe("org_db");
    expect(result.conversation.formId).toBe("form_db");
    expect(result.conversation.form.id).toBe("form_db");
    expect(result.conversation.metaData.isOwnerPreview).toBe(false);
    expect(result.currentFieldId).toBe("field_1");
  });

  it("derives owner preview from org membership, not stored or client metadata", async () => {
    const db = createDb({
      conversation: buildConversation({
        metaData: { isOwnerPreview: true },
      }),
      isMember: false,
    });

    const result = await getTrustedConversationForRespondent(
      { conversationId: "conv_1", formId: "form_db" },
      "clerk_user_1",
      { db },
    );

    expect(result.conversation.metaData.isOwnerPreview).toBe(false);
  });

  it("marks a real organization member as owner preview", async () => {
    const db = createDb({ isMember: true });

    const result = await getTrustedConversationForRespondent(
      { conversationId: "conv_1", formId: "form_db" },
      "clerk_user_1",
      { db },
    );

    expect(result.conversation.metaData.isOwnerPreview).toBe(true);
  });

  it("rejects a body formId that does not match the stored conversation", async () => {
    const db = createDb();

    await expect(
      getTrustedConversationForRespondent(
        { conversationId: "conv_1", formId: "form_attacker" },
        null,
        { db },
      ),
    ).rejects.toMatchObject<Partial<ConversationAccessError>>({
      message: "Conversation not found",
      statusCode: 404,
    });
  });

  it("rejects a finished conversation", async () => {
    const db = createDb({
      conversation: buildConversation({ finishedAt: new Date() }),
    });

    await expect(
      getTrustedConversationForRespondent(
        { conversationId: "conv_1", formId: "form_db" },
        null,
        { db },
      ),
    ).rejects.toMatchObject<Partial<ConversationAccessError>>({
      message: "Conversation already completed",
      statusCode: 409,
    });
  });
});

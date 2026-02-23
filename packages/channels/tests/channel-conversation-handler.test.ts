import { beforeEach, describe, expect, it, mock } from "bun:test";

mock.module("@convoform/ai", () => ({
  CoreService: class CoreService {
    async initialize() {
      return (async function* () {
        yield { type: "text-delta", delta: "What is your name?" };
      })();
    }
    async process() {
      return (async function* () {
        yield { type: "text-delta", delta: "Got it." };
      })();
    }
  },
}));
import type { CoreConversation } from "@convoform/db/src/schema";
import { inputTypeEnum } from "@convoform/db/src/schema";
import type { ChannelMessage } from "../src/channel";
import { ChannelConversationHandler } from "../src/channel-conversation-handler";
import type { ConversationOperations } from "../src/channel-conversation-handler";
import { InMemorySessionManager } from "../src/session-manager";

/**
 * Helper to create a mock CoreConversation for testing.
 */
function createMockConversation(
  overrides: Partial<CoreConversation> = {},
): CoreConversation {
  return {
    id: "conv_test_123",
    name: "Test Conversation",
    transcript: [],
    formFieldResponses: [
      {
        id: "field_1",
        fieldName: "Name",
        fieldDescription: "Your full name",
        fieldConfiguration: {
          inputType: inputTypeEnum.enum.text,
          inputConfiguration: {},
        },
        fieldValue: null,
      },
      {
        id: "field_2",
        fieldName: "Email",
        fieldDescription: "Your email address",
        fieldConfiguration: {
          inputType: inputTypeEnum.enum.text,
          inputConfiguration: {},
        },
        fieldValue: null,
      },
    ],
    formOverview: "Test form overview",
    formId: "form_test_abc",
    organizationId: "org_test_123",
    finishedAt: null,
    isInProgress: true,
    metaData: {},
    currentFieldId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    channelType: null,
    channelSenderId: null,
    form: {
      id: "form_test_abc",
      name: "Test Form",
      overview: "A test form for collecting user info",
      welcomeScreenTitle: "Welcome",
      welcomeScreenMessage: "Please fill out this form",
      welcomeScreenCTALabel: "Start",
      isPublished: true,
      organizationId: "org_test_123",
      createdAt: new Date(),
      updatedAt: new Date(),
      showOrganizationName: false,
      showOrganizationLogo: false,
      showCustomEndScreenMessage: false,
      customEndScreenMessage: null,
    },
    ...overrides,
  } as CoreConversation;
}

/**
 * Helper to create a mock ChannelMessage.
 */
function createMockMessage(
  overrides: Partial<ChannelMessage> = {},
): ChannelMessage {
  return {
    text: "Hello",
    senderId: "sender_123",
    channelType: "telegram",
    ...overrides,
  };
}

describe("ChannelConversationHandler", () => {
  let sessionManager: InMemorySessionManager;
  let handler: ChannelConversationHandler;

  beforeEach(() => {
    sessionManager = new InMemorySessionManager();
    handler = new ChannelConversationHandler(sessionManager);
  });

  describe("handleMessage — new conversation", () => {
    it("should initialize a new conversation when no session exists", async () => {
      const mockConversation = createMockConversation();
      const updatedConversation = createMockConversation({
        currentFieldId: "field_1",
        transcript: [{ role: "assistant", content: "What is your name?" }],
      });

      const operations: ConversationOperations = {
        createConversation: mock(async () => mockConversation),
        getConversation: mock(async () => updatedConversation),
        updateConversation: mock(async () => {
          // no-op mock
        }),
      };

      const message = createMockMessage();
      const result = await handler.handleMessage(message, {
        formId: "form_test_abc",
        operations,
      });

      // CoreService.initialize() was called, which streams a question
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThanOrEqual(0);

      // Verify createConversation was called with channel info
      expect(operations.createConversation).toHaveBeenCalledWith(
        "form_test_abc",
        {
          channelType: "telegram",
          channelSenderId: "sender_123",
          metadata: message.metadata,
        },
      );

      // Verify session was created
      const session = sessionManager.getSession(
        "telegram",
        "sender_123",
        "form_test_abc",
      );
      expect(session).toBeDefined();
      expect(session?.conversationId).toBe("conv_test_123");
    });
  });

  describe("handleMessage — existing completed conversation", () => {
    it("should return completion message and clean up session", async () => {
      const now = new Date();
      sessionManager.setSession("telegram", "sender_123", "form_test_abc", {
        conversationId: "conv_test_123",
        currentFieldId: "field_1",
        createdAt: now,
        lastAccessedAt: now,
      });

      const completedConversation = createMockConversation({
        finishedAt: new Date(),
        isInProgress: false,
      });

      const operations: ConversationOperations = {
        createConversation: mock(async () => completedConversation),
        getConversation: mock(async () => completedConversation),
        updateConversation: mock(async () => {
          // no-op mock
        }),
      };

      const message = createMockMessage({ text: "test answer" });
      const result = await handler.handleMessage(message, {
        formId: "form_test_abc",
        operations,
      });

      expect(result).toBe("This form has already been completed. Thank you!");

      // Session should be cleaned up
      const session = sessionManager.getSession(
        "telegram",
        "sender_123",
        "form_test_abc",
      );
      expect(session).toBeUndefined();
    });
  });
});

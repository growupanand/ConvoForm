import type { ChatStatus } from "ai";
import type { ConversationServiceUIMessage } from "../../ai";
import type { CoreConversation } from "../../db/src/schema";

/**
 *
 * Note: For some reason without this export i am getting type error in useConvoForm,
 * where it is not able to resolve Conversation type
 */
export type { Schema } from "../../db";

export type ConversationState =
  | "idle" // Initial state, no conversation started
  | "initializing" // Creating new conversation
  | "inProgress" // Conversation in progress
  | "completed"; // All fields collected, conversation finished

export type State = {
  /** Current field id */
  currentFieldId: string | null;
  /** Current question text */
  currentQuestionText: string | null;
  /** Conversation object from db */
  conversation: CoreConversation | null;
  /** Whole conversation state */
  conversationState: ConversationState;
  /** Whole conversation submission progress */
  progress: number;
  /** Streaming status of the chat */
  chatStatus: ChatStatus;
  /** Messages */
  messages: ConversationServiceUIMessage[];
  /** Error */
  error: Error | undefined;
};

export type Methods = {
  /** Create a new conversation in db and start conversation */
  initializeConversation: () => Promise<void>;
  /**
   * Submit an answer to the current question
   *
   * @param answer The answer text to the current question
   * @returns Promise<void> this promise will resolve when the answer is submitted and
   * the next question streaming text is ready
   */
  submitAnswer: (answerText: string) => Promise<void>;
  /**
   * Reset the conversation
   *
   * @returns Promise<void> this promise will resolve when the conversation is reset
   */
  resetConversation: () => Promise<void>;
};

export type EventHandlers = {
  onUpdateConversation?: (conversation: CoreConversation) => Promise<void>;
  onError?: (error: Error) => void;
  onFinish?: (conversation: CoreConversation) => void;
};

export type UseConvoFormProps = EventHandlers & {
  formId: string;
  apiDomain?: string;
};

export type UseConvoFormReturnType = State & Methods;

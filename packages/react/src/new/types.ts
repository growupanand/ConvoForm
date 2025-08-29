import type { Conversation } from "@convoform/db/src/schema";

export type ConversationState =
  | "idle" // Initial state, no conversation started
  | "initializing" // Creating new conversation
  | "awaitingQuestion" // Conversation created, waiting for question
  | "streamingQuestion" // Question is being streamed
  | "awaitingUserInput" // Question received, ready for user input
  | "completed"; // All fields collected, conversation finished

export type State = {
  /** Current field id */
  currentFieldId: string | null;
  /** Current question text */
  currentQuestionText: string | null;
  /** Conversation object from db */
  conversation: Conversation | null;
  /** Whole conversation state */
  conversationState: ConversationState;
  /** Whole conversation submission progress */
  progress: number | null;
  /** Whether a question is currently being streamed */
  isStreamingQuestion: boolean;
};

export type Methods = {
  /** Create a new conversation in db and start conversation */
  initializeConversation: () => Promise<Conversation>;
  /**
   * Submit an answer to the current question
   *
   * @param answer The answer text to the current question
   * @returns Promise<void> this promise will resolve when the answer is submitted and
   * the next question streaming text is ready
   */
  submitAnswer: (answer: string) => Promise<void>;
  /**
   * Reset the conversation
   *
   * @returns Promise<void> this promise will resolve when the conversation is reset
   */
  resetConversation: () => Promise<void>;
};

export type EventHandlers = {
  onError: (error: Error) => void;
  onFinish: (conversation: Conversation) => void;
};

export type Handlers = {
  onUpdateConversation: (conversation: Conversation) => Promise<void>;
  onError: (error: Error) => void;
  onFinish: (conversation: Conversation) => void;
};

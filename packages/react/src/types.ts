import type { Conversation } from "@convoform/db/src/schema";

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue;
    }
  | Array<JSONValue>;

export type SubmitAnswer = (
  answer: string,
  newConversation?: Conversation,
) => Promise<void>;

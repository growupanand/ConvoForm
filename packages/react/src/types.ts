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
  initialMessage?: boolean,
) => Promise<void>;

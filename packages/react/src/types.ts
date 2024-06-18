export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue;
    }
  | Array<JSONValue>;

export type ExtraStreamData = {
  id?: string;
  collectedData?: Record<string, any>;
  currentField?: string;
  isFormSubmissionFinished?: boolean;
};

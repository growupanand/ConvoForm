/**
 * This utils will help to parse stream response coming from the server
 */

import { JSONValue } from "ai";

const textStreamLineParser = {
  code: "0",
  name: "text",
  parse: (value: string) => {
    if (typeof value !== "string") {
      throw new Error("Unable to parse text stream line");
    }
    return { value, type: "text" };
  },
};

const dataStreamLineParser = {
  code: "2",
  name: "data",
  parse: (value: JSONValue) => {
    if (!Array.isArray(value)) {
      throw new Error('"data" parts expect an array value.');
    }

    if (value.length > 0 && typeof value[0] !== "object") {
      throw new Error(
        '"data" parts expect an array value with an object as the first element.',
      );
    }

    return { type: "data", value } as {
      type: "data";
      value: Record<string, any>;
    };
  },
};

const streamLineParsers = [textStreamLineParser, dataStreamLineParser];
const streamLineParsersMap = new Map(
  streamLineParsers.map((parser) => [parser.code, parser]),
);
const validStreamLineCodes = streamLineParsers.map((parser) => parser.code);

export const parseStreamLine = (line: string) => {
  const firstSeparatorIndex = line.indexOf(":");
  if (firstSeparatorIndex === -1) {
    throw new Error("Invalid stream line");
  }
  const streamLineCode = line.slice(0, firstSeparatorIndex);

  // check if the stream line value type is valid
  if (!validStreamLineCodes.includes(streamLineCode)) {
    throw new Error(`Invalid stream line code: ${streamLineCode}`);
  }

  const streamLineString = line.slice(firstSeparatorIndex + 1);
  const streamLineValue = JSON.parse(streamLineString);
  const parser = streamLineParsersMap.get(streamLineCode);

  if (!parser) {
    throw new Error(`No parser found for stream line code: ${streamLineCode}`);
  }

  return parser.parse(streamLineValue);
};

const createChunkDecoder = () => {
  const decoder = new TextDecoder();
  return (chunk: Uint8Array | undefined) =>
    chunk
      ? decoder
          .decode(chunk, { stream: true })
          .split("\n")
          .filter((line) => line !== "")
      : "";
};

export async function* readResponseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const decoder = createChunkDecoder();

  let data: Record<string, any> = {};

  while (true) {
    let textValue = "";
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const decoded = decoder(value);
    if (typeof decoded === "string") {
      textValue = decoded;
    } else {
      decoded.map(parseStreamLine).forEach((line) => {
        if (
          line.type === "data" &&
          line.value &&
          typeof line.value === "object"
        ) {
          data = Array.isArray(line.value) ? line.value[0] : line.value;
        }

        if (line.type === "text") {
          textValue += line.value;
        }
      });
    }
    yield { textValue, data };
  }
}

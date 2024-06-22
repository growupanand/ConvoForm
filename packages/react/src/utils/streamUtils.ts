/**
 * This utils will help to parse stream response coming from the server
 */

import { JSONValue } from "../types";

const NEWLINE = "\n".charCodeAt(0);

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

// concatenates all the chunks into a single Uint8Array
function concatChunks(chunks: Uint8Array[], totalLength: number) {
  const concatenatedChunks = new Uint8Array(totalLength);

  let offset = 0;
  for (const chunk of chunks) {
    concatenatedChunks.set(chunk, offset);
    offset += chunk.length;
  }
  chunks.length = 0;

  return concatenatedChunks;
}

export async function* readResponseStream<Data extends Record<string, any>>(
  reader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const chunks: Uint8Array[] = [];
  const decoder = new TextDecoder();
  let totalLength = 0;

  let data: Data = {} as Data;

  while (true) {
    let textValue = "";
    const { value } = await reader.read();

    if (value) {
      chunks.push(value);
      totalLength += value.length;
      if (value[value.length - 1] !== NEWLINE) {
        // if the last character is not a newline, we have not read the whole JSON value
        continue;
      }
    }

    if (chunks.length === 0) {
      break; // we have reached the end of the stream
    }

    const concatenatedChunks = concatChunks(chunks, totalLength);
    totalLength = 0;

    decoder
      .decode(concatenatedChunks, { stream: true })
      .split("\n")
      .filter((line) => line !== "") // splitting leaves an empty string at the end
      .map(parseStreamLine)
      .forEach((line) => {
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
    yield { textValue, data };
  }
}

---
trigger: always_on
---

# AI SDK Testing Guide

Testing language models can be challenging because they are non-deterministic, slow, and expensive. To enable unit testing, AI SDK Core includes mock providers and helpers in `ai/test`.

Common helpers:
- `mockId`: Incrementing integer ID.
- `mockValues`: Iterates over an array of values.
- `simulateReadableStream`: Simulates a readable stream with delays.

---

# AI SDK 4.x

Use `MockLanguageModelV1` and `MockEmbeddingModelV1`.

## Examples (v4)

### generateText
```ts
import { generateText } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';

const result = await generateText({
  model: new MockLanguageModelV1({
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 20 },
      text: `Hello, world!`,
    }),
  }),
  prompt: 'Hello, test!',
});
```

### streamText
```ts
import { streamText, simulateReadableStream } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';

const result = streamText({
  model: new MockLanguageModelV1({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-delta', textDelta: 'Hello' }, // Note: textDelta
          { type: 'text-delta', textDelta: ', ' },
          { type: 'text-delta', textDelta: `world!` },
          {
            type: 'finish',
            finishReason: 'stop',
            logprobs: undefined,
            usage: { completionTokens: 10, promptTokens: 3 },
          },
        ],
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  }),
  prompt: 'Hello, test!',
});
```

### generateObject / streamObject
Follows similar patterns. `generateObject` returns `text` containing JSON. `streamObject` streams chunks with `textDelta`.

---

# AI SDK 5.x & 6.x

- **v5**: Use `MockLanguageModelV2`.
- **v6**: Use `MockLanguageModelV3`.

**Key Changes from v4**:
- Content is returned as `content: [{ type: 'text', text: ... }]` array instead of top-level `text`.
- Streaming chunks use `delta` instead of `textDelta` and include `id`.
- **v6 specific**: `usage` and `finishReason` structures are more detailed.

## Examples (v5 & v6)

### generateText

**v5 Setup**:
```ts
import { generateText } from 'ai';
import { MockLanguageModelV2 } from 'ai/test';

const result = await generateText({
  model: new MockLanguageModelV2({
    doGenerate: async () => ({
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: 'text', text: `Hello, world!` }],
      warnings: [],
    }),
  }),
  prompt: 'Hello, test!',
});
```

**v6 Setup** (Note nested usage/finishReason):
```ts
import { generateText } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';

const result = await generateText({
  model: new MockLanguageModelV3({
    doGenerate: async () => ({
      content: [{ type: 'text', text: `Hello, world!` }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10 },
        outputTokens: { total: 20, text: 20 },
      },
      warnings: [],
    }),
  }),
  prompt: 'Hello, test!',
});
```

### streamText (v5 & v6)

Both versions use the same chunk structure (`text-start`, `text-delta` with `delta`, `text-end`). The `finish` chunk differs slightly in `usage`/`finishReason` matching the generation models above.

```ts
import { streamText, simulateReadableStream } from 'ai';
// import MockLanguageModelV2 or V3

const result = streamText({
  model: new MockLanguageModelV2({ // or V3
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: 'Hello' }, // Note: delta, not textDelta
          { type: 'text-delta', id: 'text-1', delta: 'world!' },
          { type: 'text-end', id: 'text-1' },
          {
            type: 'finish',
            finishReason: 'stop', // v6: { unified: 'stop', ... }
            usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 }, // v6: nested objects
          },
        ],
      }),
    }),
  }),
  prompt: 'Hello, test!',
});
```

### generateObject

**v5/v6 Common Pattern**:
Return JSON string inside content text.

```ts
// v5
content: [{ type: 'text', text: `{"content":"Hello, world!"}` }]
```

### streamObject (v5 & v6)

Streams JSON parts using `delta`.

```ts
chunks: [
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', delta: '{ ' },
  { type: 'text-delta', id: 'text-1', delta: '"content": "Hello"' },
  { type: 'text-delta', id: 'text-1', delta: ' }' },
  { type: 'text-end', id: 'text-1' },
  // ... finish chunk
]
```

### Data/UI Stream Simulation (General)

Use `simulateReadableStream` piped through `TextEncoderStream`.

```ts
// v4/v5/v6 compatible approach for route handlers
import { simulateReadableStream } from 'ai';

export async function POST(req: Request) {
  return new Response(
    simulateReadableStream({
      initialDelayInMs: 1000,
      chunks: [
        // Protocol specific chunks (Data Stream or UI Stream)
        `0:"This"\n`, // Data stream example
        // or
        `data: {"type":"text-delta",...}\n\n`, // UI stream example
      ],
    }).pipeThrough(new TextEncoderStream()),
    { status: 200, headers: { ... } }
  );
}
```
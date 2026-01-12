# @convoform/tracing

OpenTelemetry distributed tracing package for ConvoForm with Axiom integration.

## Features

- 🔍 **Distributed Tracing**: Track requests across frontend, API, and WebSocket services
- 📊 **Axiom Integration**: Export traces to Axiom via OTLP
- 🌐 **W3C Trace Context**: Standard trace propagation via `traceparent` headers
- ⚡ **Vercel Edge Compatible**: Lightweight approach that works on Edge runtime

## Installation

This package is included in the monorepo. Add it as a dependency:

```json
{
  "dependencies": {
    "@convoform/tracing": "workspace:*"
  }
}
```

## Environment Variables

```bash
# Required for Axiom tracing
AXIOM_OTLP_TOKEN=xaat-xxx          # Axiom ingest token
AXIOM_TRACES_DATASET=convoform-traces  # Dataset name
AXIOM_TRACING_ENABLED=true         # Enable tracing

# Optional: Console output for debugging
TRACING_CONSOLE_ENABLED=true
```

## Usage

### Basic Usage

```typescript
import { getTracer } from "@convoform/tracing";

const tracer = getTracer("web-api");

// Wrap async operations in spans
await tracer.withSpan("process-conversation", async (span) => {
  span.setAttribute("conversation.id", conversationId);
  // ... your logic
});
```

### Manual Span Management

```typescript
const span = tracer.startSpan("my-operation", {
  "conversation.id": conversationId,
  "field.id": fieldId,
});

try {
  // ... your logic
} finally {
  span.end();
}
```

### Frontend Trace Context

```typescript
import { createRootTraceContext } from "@convoform/tracing";

// Generate trace context for a new request
const { traceId, traceparent } = createRootTraceContext();

// Include in API request
fetch("/api/conversation", {
  headers: {
    traceparent,
  },
});
```

### Extracting Context in Backend

```typescript
import { extractTraceContext } from "@convoform/tracing";

export async function POST(request: Request) {
  const headers = Object.fromEntries(request.headers);
  const parentContext = extractTraceContext(headers);
  
  // Use parentContext to link child spans
}
```

## Span Attributes

The package includes typed attributes for conversation tracing:

- `conversation.id` - Conversation UUID
- `conversation.form_id` - Form UUID
- `conversation.organization_id` - Organization UUID
- `conversation.type` - "new" or "existing"
- `field.id` - Current field ID
- `field.type` - Field type (text, select, etc.)
- `ai.model` - AI model used
- `ai.token_count` - Tokens consumed
- `ai.duration_ms` - AI processing time

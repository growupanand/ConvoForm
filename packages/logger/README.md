# @convoform/logger

Generic logging package for ConvoForm with Axiom integration and performance tracking.

## Features

- ✅ **Axiom Integration** - Send logs to Axiom for production monitoring
- ✅ **Console Logging** - Pretty-printed logs for development
- ✅ **Performance Tracking** - Built-in timers with incremental checkpoints
- ✅ **Context Propagation** - Automatic conversationId in all logs
- ✅ **Environment-Based Config** - Configure via environment variables
- ✅ **Provider-Agnostic** - Easy to swap logging providers

## Installation

Already installed as workspace package:

```typescript
import { getLogger, createConversationLogger } from "@convoform/logger";
```

## Environment Variables

```bash
# Log level (debug, info, warn, error)
LOGGER_LEVEL=info

# Axiom configuration
AXIOM_TOKEN=xaat-your-token-here
AXIOM_DATASET=convoform-dev
AXIOM_ENABLED=true

# Console configuration
LOGGER_CONSOLE_ENABLED=true
LOGGER_CONSOLE_PRETTY=true

# Environment
NODE_ENV=development
```

## Usage

### Basic Logging

```typescript
import { getLogger } from "@convoform/logger";

const logger = getLogger();

logger.info("User submitted answer", { 
  conversationId: "conv_123",
  fieldId: "field_001" 
});
```

### Logger with Context

```typescript
import { createConversationLogger } from "@convoform/logger";

const logger = createConversationLogger({
  conversationId: "conv_123",
  formId: "form_456",
  organizationId: "org_789"
});

// All logs now include conversation context
logger.info("Processing answer");
// → Logs with conversationId, formId, organizationId automatically
```

### Performance Tracking

```typescript
const logger = getLogger();

// Start timer
const timer = logger.startTimer("conversation.process", {
  conversationId: "conv_123"
});

// Do some work
await updateField();
timer.checkpoint("field_updated"); // Logs: 50ms since start

// More work
await validateAnswer();
timer.checkpoint("answer_validated"); // Logs: 150ms since last checkpoint

// Finish
await saveAnswer();
timer.end(); // Logs total duration + final checkpoint
```

### Output Example

**Console (Development):**
```
[DEBUG] conversation.process started { conversationId: 'conv_123', operation: 'conversation.process' }
[DEBUG] conversation.process → field_updated { timeSinceLastCheckpoint: 50ms, timeSinceStart: 50ms }
[DEBUG] conversation.process → answer_validated { timeSinceLastCheckpoint: 150ms, timeSinceStart: 200ms }
[INFO] conversation.process completed { duration: 320ms, totalCheckpoints: 2 }
```

**Axiom (Production):**
- Queryable structured logs
- Filter by conversationId
- Track checkpoint performance
- Monitor trends over time

## Querying in Axiom

### Filter by Conversation

```apl
['convoform-dev']
| where conversationId == "conv_123"
| sort by timestamp asc
```

### Checkpoint Performance

```apl
['convoform-dev']
| where checkpoint != null
| summarize 
    avg(duration),
    max(duration),
    p95(duration)
  by checkpoint
```

### Slow Operations

```apl
['convoform-dev']
| where duration > 1000
| sort by duration desc
```

## API

### `getLogger(): ILogger`
Get singleton logger instance.

### `createLogger(config?: LoggerConfig): ILogger`
Create new logger with custom config.

### `createConversationLogger(context: LogContext): ILogger`
Create logger with conversation context.

### `ILogger.info(message, context?): void`
Log info level message.

### `ILogger.error(message, context?): void`
Log error level message.

### `ILogger.warn(message, context?): void`
Log warning level message.

### `ILogger.debug(message, context?): void`
Log debug level message.

### `ILogger.startTimer(operation, context?): ITimer`
Start performance timer.

### `ILogger.withContext(context): ILogger`
Create child logger with persistent context.

### `ITimer.checkpoint(name, context?): number`
Log checkpoint, returns incremental time.

### `ITimer.end(context?): number`
End timer, returns total duration.

## Design Philosophy

- **Provider-Agnostic**: Easy to swap Axiom for another service
- **Context-First**: conversationId flows through all logs
- **Performance-Focused**: Incremental checkpoint timing
- **Environment-Aware**: Different configs for dev/prod
- **Type-Safe**: Full TypeScript support

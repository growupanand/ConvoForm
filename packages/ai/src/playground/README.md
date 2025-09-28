# LLM Analytics Playground

This playground allows you to test PostHog LLM analytics integration with Vercel AI SDK before implementing it in production.

## 🚀 Quick Start

### 1. Install Dependencies

First, install the new dependencies:

```bash
# From project root
npm install @posthog/ai ai
```

### 2. Environment Variables  

Add these environment variables to your `.env` file:

```env
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Enable LLM Analytics (set to 'false' to disable)
NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS=true

# OpenAI API Key (you should already have this)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Run the Playground

#### Option A: Direct TypeScript execution
```bash
npx ts-node packages/ai/src/playground/llmAnalyticsPlayground.ts
```

#### Option B: Compile first, then run
```bash
npm run build
node dist/packages/ai/src/playground/llmAnalyticsPlayground.js
```

#### Option C: Use the runner script
```bash
node packages/ai/src/playground/runPlayground.js
```

## 📊 What the Playground Tests

### Test 1: Basic LLM Analytics
- Simple text generation with analytics metadata
- Verifies PostHog integration is working

### Test 2: Conversation Analytics  
- Tests conversation-specific metadata tracking
- Simulates form field question generation
- Includes formId, conversationId, organizationId

### Test 3: Form Generation Analytics
- Tests form creation workflow analytics
- Structured object generation with schemas
- Organization-level grouping

### Test 4: Extract Field Answer Analytics
- Tests the enhanced extractFieldAnswer function
- Full conversation context with field extraction
- Field type tracking

### Test 5: Anonymous User Analytics
- Tests analytics without user identification
- Uses conversationId as distinctId
- Anonymous user tracking

## 🔍 PostHog Dashboard

After running the playground, check your PostHog dashboard for:

### Event Type
- `$ai_generation` events

### Custom Properties
- `formId` - Form identifier
- `conversationId` - Conversation identifier  
- `organizationId` - Organization identifier
- `actionType` - Type of AI action (extract_field_answer, generate_field_question, etc.)
- `fieldType` - Field type (text, multipleChoice, datePicker, etc.)
- `isAnonymous` - Whether user is anonymous
- `appVersion` - App version from package.json

### User Identification
- `distinctId` - userId if available, or conversationId for anonymous users
- `userId` - Actual user ID when authenticated

### Groups
- `organization` - Organization ID for grouping analytics

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS` | Enable/disable LLM analytics | `true` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | Required |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | Required |

### Error Handling

The analytics integration is designed to **fail silently**:
- If PostHog is unavailable, AI actions continue without analytics
- If analytics fails, the original AI function still executes
- Errors are logged to console but don't break functionality

## 📁 File Structure

```
packages/ai/src/
├── playground/
│   ├── llmAnalyticsPlayground.ts  # Main playground file
│   ├── runPlayground.js           # Node.js runner script  
│   └── README.md                  # This file
├── utils/
│   └── llmAnalytics.ts           # Analytics utilities
├── ai-actions/
│   └── extractFieldAnswerWithAnalytics.ts  # Example enhanced action
└── config.ts                     # Updated with getTracedModelConfig()
```

## 🔧 Integration Example

Here's how to integrate analytics into your existing AI actions:

```typescript
import { createConversationTracedModel, AI_ACTION_TYPES } from '../utils/llmAnalytics';

export async function myAIAction(params) {
  // Create traced model with metadata
  const tracedModel = createConversationTracedModel({
    formId: params.formId,
    conversationId: params.conversationId,
    organizationId: params.organizationId,
    userId: params.userId,
    actionType: AI_ACTION_TYPES.MY_ACTION,
    fieldType: params.fieldType,
  });

  // Use traced model instead of getModelConfig()
  return await generateText({
    model: tracedModel,  // <-- Use traced model here
    prompt: "Your prompt here",
    temperature: 0.1,
  });
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot find module '@posthog/ai'"**
   - Run `npm install @posthog/ai ai` to install dependencies

2. **No events appearing in PostHog**
   - Check environment variables are set correctly
   - Verify PostHog project API key and host
   - Confirm `NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS=true`

3. **TypeScript errors**
   - Ensure dependencies are installed
   - Check that `@convoform/analytics` package exports are available

4. **API key errors**  
   - Verify `OPENAI_API_KEY` is set and valid
   - Check API key has sufficient credits/quota

### Debug Mode

Set `NODE_ENV=development` to see detailed logs:

```bash
NODE_ENV=development npx ts-node packages/ai/src/playground/llmAnalyticsPlayground.ts
```

## 🎯 Next Steps

After successful playground testing:

1. **Integrate into existing AI actions**
   - Replace `getModelConfig()` with `getTracedModelConfig(metadata)`
   - Add analytics metadata to action parameters

2. **Update tRPC procedures**
   - Pass user/form context to AI actions
   - Include organizationId, userId, etc.

3. **Production deployment**
   - Set environment variables in production
   - Monitor PostHog for analytics data
   - Adjust metadata based on insights

4. **Dashboard setup**
   - Create PostHog insights for LLM usage
   - Set up alerts for high usage/costs
   - Track performance metrics

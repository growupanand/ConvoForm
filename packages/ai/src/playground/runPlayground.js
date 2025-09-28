#!/usr/bin/env node

/**
 * Simple Node.js runner for the LLM Analytics Playground
 * Run with: node packages/ai/src/playground/runPlayground.js
 */

require('dotenv').config();

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST', 
  'OPENAI_API_KEY'
];

console.log('🔍 Environment Variables Check:');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease add these to your .env file before running the playground.');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Set LLM analytics to enabled for playground
process.env.NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS = 'true';

console.log('\n🎮 Loading LLM Analytics Playground...');

// Note: In a real environment, you would compile TypeScript first
// For now, this serves as a runner template
console.log(`
📋 To run the playground:

1. Make sure you have the required environment variables in your .env file:
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host  
   OPENAI_API_KEY=your_openai_key
   NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS=true

2. Compile and run the TypeScript playground:
   npm run build
   node dist/packages/ai/src/playground/llmAnalyticsPlayground.js

3. Or use ts-node directly:
   npx ts-node packages/ai/src/playground/llmAnalyticsPlayground.ts

4. Check your PostHog dashboard for $ai_generation events

🎯 Expected Events in PostHog:
- Event Type: $ai_generation
- Custom Properties: formId, conversationId, organizationId, actionType, fieldType
- User Identification: userId (if provided) or distinctId
- Groups: organization (if organizationId provided)
`);

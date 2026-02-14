<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-12 | Updated: 2026-02-12 -->

# email

## Purpose
This package handles email functionality for the ConvoForm application. It provides a unified interface for sending emails using various providers (currently implemented: Resend).

## Key Components

### Exports
- **`sendEmail(options: SendEmailOptions)`**: Generic function to send an email.
- **`sendFormResponseEmail(options)`**: Specific helper function to send form submission notifications.

### Providers
- **`ResendProvider`**: Implements the `EmailProvider` interface using the [Resend SDK](https://resend.com).

## Configuration

The package relies on the following environment variables:

- **`RESEND_API_KEY`**: API key for Resend.
- **`EMAIL_FROM`**: default sender email address (e.g., `onboarding@resend.dev` or your verified domain).
- **`NEXT_PUBLIC_APP_URL`**: Used to construct links in email templates (e.g., "View Response" link).
- **`AXIOM_TOKEN`**, **`AXIOM_DATASET`**: Used by `@convoform/logger` for operational logging.

## Logging

This package uses `@convoform/logger` to log email sending events.
- **Success**: Logs "Email sent via Resend" with message ID.
- **Failure**: Logs "Failed to send email via Resend" with error details.
- **Warnings**: Logs if API keys are missing.

## Usage Example

```typescript
import { sendFormResponseEmail } from "@convoform/email";

await sendFormResponseEmail({
  to: "user@example.com",
  formName: "My Form",
  responseId: "conversation-id",
});
```

## For AI Agents

### Working In This Directory
- **Package manager**: `pnpm`
- **Source**: `src/index.ts` is the entry point. `src/providers/resend.ts` contains the provider logic.
- **Testing**: Run `pnpm run test` to execute unit tests. Mocks are in place for Resend.

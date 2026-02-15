# Agents Context

This package `@convoform/integration` is responsible for handling all external third-party integrations.

## Core Concepts

- **Providers**: Classes that implement integration logic (e.g., `GoogleSheetsProvider`).
- **Authentication**: Usage of OAuth 2.0 where applicable. Tokens are stored encrypted in the database.
- **Syncing**: The `onResponse` method in providers is called to push new form data to the external service.

## Adding a New Integration

1. Create a new provider class in `src/providers`.
2. Implement the necessary methods for auth and data sync.
3. Register the provider in `packages/api/src/router/integration.ts` factory.
4. Update the `Schema.integration` provider enum if necessary (or just string usage).

## Dependencies

- `googleapis`: Used for Google Sheets API interactions.
- `google-auth-library`: Used for Google OAuth flow.

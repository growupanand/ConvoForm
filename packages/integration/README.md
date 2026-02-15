# @convoform/integration

External service integrations for ConvoForm.

## Overview

This package handles connections to third-party services like Google Sheets. It provides a standardized interface for authenticating and syncing form data.

## Integrations

### Google Sheets

Authenticates using OAuth 2.0 and appends form submissions to a specified spreadsheet.

#### Configuration

Requires the following environment variables (set in `packages/api` context):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

The Oauth tokens are encrypted at rest using `ENCRYPTION_KEY`.

# API Routers Documentation

This document provides a comprehensive overview of the tRPC routers available in the `@convoform/api` package.

## Router Overview

The API is structured into several routers, combined in the root `appRouter`.

| Router Name | Description |
| :--- | :--- |
| `formRouter` | Manage forms (create, read, update, delete) |
| `conversationRouter` | Manage form submissions/conversations and statistics |
| `formFieldRouter` | Manage individual fields within a form |
| `formDesignRouter` | Manage form visual design and styling |
| `fileUploadRouter` | Handle file uploads, downloads, and storage management |
| `aiFormGenerationRouter` | AI capabilities for generating forms and questions |
| `metricsRouter` | Dashboard metrics and analytics |
| `organizationRouter` | Organization-level data |
| `usageRouter` | Usage tracking and limits |
| `webhookRouter` | Webhook handlers for external events (Clerk, etc.) |
| `googleRouter` | Google Drive/Forms integration |
| `usersRouter` | User management and stats |

---

## `formRouter`

Handles the core Form entity operations.

### Procedures

- **`create`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `CreateFormInput` (name, overview, etc.)
    - **Output**: Created form object with default fields and design.
- **`getAll`** (`query`, `authProtectedProcedure`)
    - **Input**: `{ organizationId: string }`
    - **Output**: Array of forms for the organization.
- **`getOne`** (`query`, `publicProcedure`)
    - **Input**: `{ id: string }`
    - **Output**: Form object.
- **`getOneWithFields`** (`query`, `publicProcedure`)
    - **Input**: `{ id: string }`
    - **Output**: Form object with included `formFields` and `formDesigns`.
- **`patch`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `patchFormSchema` (partial update)
    - **Output**: Updated form.
- **`updateForm`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `updateFormInputSchema` (full update excluding fields)
    - **Output**: Updated form.
- **`delete`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ id: string }`
    - **Output**: Deleted form object.
- **`updateShowOrganizationName`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formId: string, showOrganizationName: boolean, organizationName?: string }`
- **`updateShowOrganizationLogo`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formId: string, showOrganizationLogo: boolean, organizationLogoUrl?: string }`
- **`updateShowCustomEndScreenMessage`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formId: string, showCustomEndScreenMessage: boolean, customEndScreenMessage?: string }`
- **`updateIsPublished`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formId: string, isPublished: boolean }`

---

## `conversationRouter`

Manages form submissions (conversations) between respondents and the form.

### Procedures

- **`getAll`** (`query`, `authProtectedProcedure`)
    - **Input**: `{ formId: string }`
    - **Output**: List of conversations for a form.
- **`getOne`** (`query`, `publicProcedure`)
    - **Input**: `{ id: string }`
    - **Output**: Single conversation details.
- **`create`** (`mutation`, `publicProcedure`)
    - **Input**: `insertConversationSchema`
    - **Output**: Created conversation.
- **`stats`** (`query`, `orgProtectedProcedure`)
    - **Input**: `{ formId?: string }`
    - **Output**: Statistics object (totalCount, finishedTotalCount, bounceRate, etc.).
- **`multiChoiceStats`** (`query`, `orgProtectedProcedure`)
    - **Input**: `{ formId: string }`
    - **Output**: Aggregated stats for multiple choice fields.
- **`ratingStats`** (`query`, `orgProtectedProcedure`)
    - **Input**: `{ formId: string }`
    - **Output**: Aggregated stats for rating fields.
- **`updateFormFieldResponses`** (`mutation`, `publicProcedure`)
    - **Input**: `{ id: string, formFieldResponses: ... }`
- **`updateTranscript`** (`mutation`, `publicProcedure`)
    - **Input**: `{ id: string, transcript: ... }`
- **`generateInsights`** (`mutation`, `publicProcedure`)
    - **Input**: `{ conversationId: string }`
    - **Output**: AI-generated insights for the conversation.

---

## `formFieldRouter`

Manage individual fields (questions) within a form.

### Procedures

- **`createFormField`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `insertFormFieldSchema`
    - **Output**: void (creates field and updates order).
- **`patchFormField`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `patchFormFieldSchema`
- **`updateFormField`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `updateFormFieldSchema`
- **`deleteFormField`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ id: string }`

---

## `aiFormGenerationRouter`

AI-powered features for generating forms.

### Procedures

- **`generateFields`** (`mutation`, `publicProcedure`)
    - **Input**: `{ formContext: string, maxFields?: number, templateType?: string }`
    - **Output**: Array of suggested form fields.
- **`generateMetadata`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formContext: string, selectedFields: ... }`
    - **Output**: Generated form title, description, and messages.
- **`createFormFromFields`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ formName, formDescription, selectedFields, organizationId, ... }`
    - **Output**: Result object with created form details.
- **`getTemplates`** (`query`, `publicProcedure`)
    - **Output**: List of available form templates.

---

## `fileUploadRouter`

Handles file storage operations.

### Procedures

- **`uploadFile`** (`mutation`, `publicProcedure`)
    - **Input**: `{ fileName, fileType, fileSize, fileBuffer, conversationId }`
    - **Output**: `{ fileId, storedPath, ... }`
- **`getDownloadUrl`** (`mutation`, `orgProtectedProcedure`)
    - **Input**: `{ fileId: string }`
    - **Output**: Signed download URL.
- **`deleteFile`** (`mutation`, `authProtectedProcedure`)
    - **Input**: `{ fileId: string, organizationId: string }`
- **`getOrganizationStats`** (`query`, `authProtectedProcedure`)
    - **Input**: `{ organizationId: string }`
    - **Output**: Storage and bandwidth usage statistics.

---

## `metricsRouter`

Dashboard metrics.

### Procedures

- **`getFormMetrics`** (`query`, `authProtectedProcedure`)
    - **Input**: `{ organizationId: string }`
    - **Output**: Form creation trends and totals.

---

## `formDesignRouter`

### Procedures

- **`create`**, **`getAll`**, **`getOne`**, **`delete`**, **`patch`**
- Manages `FormDesign` entities (theme, colors) for different screen types.

---

## `usageRouter`

### Procedures

- **`getUsgae`** (`query`, `orgProtectedProcedure`)
    - **Output**: Array of usage stats (Responses count, Storage used) compared to plan limits.

---

## `webhookRouter`

Handles incoming webhooks from external services (e.g., Clerk).

### Procedures

- **`userCreated`**, **`userDeleted`**
- **`organizationCreated`**, **`organizationDeleted`**
- **`organizationMembershipCreated`**, **`organizationMembershipDeleted`**

---

## `googleRouter`

Integration with Google Drive/Forms.

### Procedures

- **`getGoogleForms`**: List Google Forms in user's Drive.
- **`getGoogleForm`**: Get details of a specific Google Form for import.

---

## `usersRouter`

### Procedures

- **`getTotalCount`**: Total system users count.
- **`getRecentUsers`**: List of recently joined users.

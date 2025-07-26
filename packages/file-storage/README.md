# File Storage Package

A robust file storage service built for ConvoForm, providing secure file upload, download, and management capabilities using Cloudflare R2 storage.

## Features

- 📁 **Secure File Upload**: Upload files with validation and organization-based storage
- 🔗 **Signed Download URLs**: Generate time-limited, secure download links
- 🗑️ **File Management**: Delete and check file existence
- ⚡ **Cloudflare R2 Integration**: Fast, scalable object storage
- 🔒 **Type Safety**: Full TypeScript support with Zod validation
- 📊 **Beta Limits**: Built-in limits for beta usage

## Installation

```bash
npm install @convoform/file-storage
```

## Configuration

Set up the following environment variables:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_DOMAIN=https://your-public-domain.com (optional)
```

## Beta Limits

Current beta limits for file uploads:

| Limit | Value |
|-------|--------|
| Max file size | 5 MB |
| Max files per response | 1 |
| Max storage per organization | 100 MB |
| File retention period | 30 days |
| Max bandwidth per month | 1 GB |
| Allowed file types | JPEG, JPG, PDF |
| Allowed extensions | `.jpg`, `.jpeg`, `.pdf` |

## Usage

### Basic Usage

```typescript
import { fileStorageService } from '@convoform/file-storage';

// Upload a file
const uploadResult = await fileStorageService.uploadFile({
  file: {
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1024000, // size in bytes
    buffer: fileBuffer
  },
  organizationId: 'org_123',
  formId: 'form_456',
  conversationId: 'conv_789' // optional
});

console.log('File uploaded:', uploadResult);
```

### Generate Download URL

```typescript
// Generate a signed download URL (expires in 15 minutes by default)
const downloadUrl = await fileStorageService.getDownloadUrl({
  storedPath: uploadResult.storedPath
});

// Custom expiry (max 1 hour)
const customExpiryUrl = await fileStorageService.getDownloadUrl({
  storedPath: uploadResult.storedPath,
  expiresInSeconds: 3600 // 1 hour
});
```

### File Management

```typescript
// Check if file exists
const exists = await fileStorageService.fileExists('uploads/org_123/form_456/file.pdf');

// Delete a file
await fileStorageService.deleteFile('uploads/org_123/form_456/file.pdf');
```

## API Reference

### `FileStorageService`

The main service class for file operations.

#### Methods

##### `uploadFile(input: FileUploadInput): Promise<FileUploadResult>`

Uploads a file to R2 storage with validation and organization.

**Parameters:**
- `input.file.name` - Original filename (1-255 characters)
- `input.file.type` - MIME type (must be in allowed types)
- `input.file.size` - File size in bytes (max 5MB)
- `input.file.buffer` - File buffer data
- `input.organizationId` - Organization identifier
- `input.formId` - Form identifier
- `input.conversationId` - Optional conversation identifier

**Returns:** `FileUploadResult`
```typescript
{
  fileId: string;           // Unique file identifier
  originalName: string;     // Original filename
  storedName: string;       // Generated storage filename
  storedPath: string;       // Full storage path
  mimeType: string;         // File MIME type
  fileSize: number;         // File size in bytes
  expiresAt: Date;          // File expiration date (30 days)
}
```

##### `getDownloadUrl(input: FileDownloadInput): Promise<string>`

Generates a signed, time-limited download URL.

**Parameters:**
- `input.storedPath` - Path to the stored file
- `input.expiresInSeconds` - URL expiry time (default: 900 seconds, max: 3600)

**Returns:** Signed download URL string

##### `deleteFile(storedPath: string): Promise<void>`

Deletes a file from storage.

**Parameters:**
- `storedPath` - Path to the file to delete

##### `fileExists(storedPath: string): Promise<boolean>`

Checks if a file exists in storage.

**Parameters:**
- `storedPath` - Path to check

**Returns:** Boolean indicating file existence

### Types

#### `FileUploadInput`

```typescript
{
  file: {
    name: string;           // 1-255 characters
    type: AllowedMimeType;  // 'image/jpeg' | 'image/jpg' | 'application/pdf'
    size: number;           // 1 byte to 5MB
    buffer: Buffer;         // File data
  };
  organizationId: string;
  formId: string;
  conversationId?: string;
}
```

#### `FileDownloadInput`

```typescript
{
  storedPath: string;
  expiresInSeconds?: number; // 1-3600 seconds, default: 900
}
```

## File Organization

Files are automatically organized in the following structure:

```
uploads/
├── {organizationId}/
│   ├── {formId}/
│   │   ├── {timestamp}-{random}.{extension}
│   │   └── ...
│   └── ...
└── ...
```

Each file is stored with:
- Timestamp prefix for chronological ordering
- Random suffix to prevent conflicts
- Original file extension preserved
- Metadata including original name, organization, form, and conversation IDs

## Error Handling

The service throws descriptive errors for various scenarios:

```typescript
try {
  await fileStorageService.uploadFile(input);
} catch (error) {
  if (error.message.includes('File size exceeds')) {
    // Handle file too large
  } else if (error.message.includes('File type') && error.message.includes('not allowed')) {
    // Handle invalid file type
  } else if (error.message.includes('Failed to upload')) {
    // Handle upload failure
  }
}
```

## Security Features

- **File Type Validation**: Only allowed MIME types and extensions
- **Size Limits**: Prevents oversized uploads
- **Signed URLs**: Time-limited, secure download links
- **Organization Isolation**: Files are isolated by organization
- **Metadata Storage**: Rich metadata for tracking and management

## Cleanup

The package includes automatic cleanup functionality to manage file retention and storage limits. Files are automatically deleted after the retention period (30 days).

## Development

For local development, ensure you have proper R2 credentials configured. The service will validate configuration on startup and throw descriptive errors for missing or invalid settings.

## License

This package is part of the ConvoForm project and follows the same licensing terms.

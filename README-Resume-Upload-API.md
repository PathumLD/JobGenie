# Resume Upload API Documentation

## Overview
The Resume Upload API provides comprehensive functionality for candidates to manage their resumes. It handles file uploads to Supabase storage, database operations, and maintains the relationship between resumes and candidate profiles.

## API Endpoint
```
POST /api/candidate/resume/upload
```

## Features

### 1. File Upload
- **Supported Formats**: PDF, DOC, DOCX
- **File Size Limit**: 10MB maximum
- **Storage**: Supabase storage with organized folder structure
- **File Naming**: `{timestamp}_{original_filename}` for uniqueness

### 2. Storage Organization
- **Bucket**: `candidate_resume`
- **Folder Structure**: `candidate_resume/{candidate_id}/{timestamp}_{filename}`
- **Example**: `candidate_resume/550e8400-e29b-41d4-a716-446655440000/1704067200000_resume.pdf`

### 3. Database Integration
- **Resume Table**: Creates records with all metadata
- **Candidate Table**: Updates `resume_url` when resume is primary
- **Primary Management**: Only one resume can be primary at a time

## API Operations

### POST - Upload Resume
Uploads a new resume file and creates database records.

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `resumeFile`: The resume file (required)
- `resumeData`: JSON string with optional metadata (optional)

**resumeData Structure:**
```json
{
  "is_primary": boolean,        // Whether this resume should be primary
  "is_allow_fetch": boolean,    // Whether AI can fetch this resume
  "original_filename": string,  // Custom filename
  "file_size": number,          // Custom file size
  "file_type": string           // Custom file type
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume_id": "uuid",
    "candidate_id": "uuid",
    "resume_url": "https://supabase-url.com/resume.pdf",
    "original_filename": "resume.pdf",
    "file_size": 245760,
    "file_type": "application/pdf",
    "is_primary": true,
    "is_allow_fetch": true,
    "uploaded_at": "2024-01-01T00:00:00.000Z",
    "storage_path": "candidate_resume/uuid/1234567890_resume.pdf",
    "public_url": "https://supabase-url.com/resume.pdf"
  }
}
```

### GET - Retrieve Resumes
Gets all resumes for the authenticated candidate.

**Request Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "candidate_id": "uuid",
    "resumes": [
      {
        "id": "uuid",
        "candidate_id": "uuid",
        "is_allow_fetch": true,
        "resume_url": "https://supabase-url.com/resume.pdf",
        "original_filename": "resume.pdf",
        "file_size": 245760,
        "file_type": "application/pdf",
        "is_primary": true,
        "uploaded_at": "2024-01-01T00:00:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total_count": 1,
    "primary_resume": {...}
  }
}
```

### PUT - Update Resume
Updates resume metadata (primary status, fetch permission).

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid",
  "is_primary": boolean,        // Optional
  "is_allow_fetch": boolean     // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "data": {...}
}
```

### DELETE - Delete Resume
Deletes a resume file and database record.

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {
    "deleted_resume_id": "uuid",
    "candidate_id": "uuid"
  }
}
```

## Business Logic

### Primary Resume Management
- Only one resume can be primary at a time
- When setting a resume as primary, all others become non-primary
- Primary resume URL is automatically updated in the candidate table
- When deleting a primary resume, the next most recent resume becomes primary

### File Validation
- **Type Check**: Only PDF, DOC, DOCX files allowed
- **Size Check**: Maximum 10MB file size
- **Required Field**: Resume file must be provided

### Security
- JWT authentication required
- Only candidates can access their own resumes
- Role-based access control (candidate role only)

### Error Handling
- Graceful handling of storage failures
- Detailed error messages for debugging
- Continues processing even if storage cleanup fails

## Database Schema Integration

### Resume Table Fields
```prisma
model Resume {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  candidate_id     String    @db.Uuid
  is_allow_fetch   Boolean?  @default(true)
  resume_url       String?
  original_filename String?   @db.VarChar(255)
  file_size        Int?
  file_type        String?   @db.VarChar(50)
  is_primary       Boolean?  @default(false)
  uploaded_at      DateTime? @default(now())
  created_at       DateTime? @default(now())
  updated_at       DateTime? @updatedAt
}
```

### Candidate Table Integration
- `resume_url` field is automatically updated when a resume becomes primary
- Maintains referential integrity with the Resume table

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

## Supabase Storage Setup

### 1. Create Storage Bucket
```sql
-- Create the candidate_resume bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate_resume', 'candidate_resume', true);
```

### 2. Set Storage Policies
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'candidate_resume' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'candidate_resume' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'candidate_resume' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Usage Examples

### Basic Upload
```javascript
const formData = new FormData();
formData.append('resumeFile', file);
formData.append('resumeData', JSON.stringify({
  is_primary: true,
  is_allow_fetch: true
}));

const response = await fetch('/api/candidate/resume/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Set Resume as Primary
```javascript
const response = await fetch('/api/candidate/resume/upload', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resume_id: 'uuid',
    is_primary: true
  })
});
```

### Delete Resume
```javascript
const response = await fetch('/api/candidate/resume/upload', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resume_id: 'uuid'
  })
});
```

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid file type, file too large, missing file |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Wrong user role (not candidate) |
| 404 | Not Found | Candidate profile or resume not found |
| 500 | Internal Server Error | Server configuration or storage errors |

## Testing

Use the provided `test-resume-upload-api.http` file to test all API endpoints. The file includes:

- File upload tests with different scenarios
- Error handling tests
- Authentication tests
- CRUD operation tests

## Notes

- All file operations are logged to the console for debugging
- Storage cleanup is attempted even if database operations fail
- The API automatically manages primary resume relationships
- File paths are sanitized to prevent security issues
- UUID validation is performed for all ID parameters

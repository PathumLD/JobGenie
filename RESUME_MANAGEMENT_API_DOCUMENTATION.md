# Resume Management API Documentation

This document provides comprehensive documentation for the Resume Management API system, including CV extraction and resume analysis features.

## Overview

The Resume Management API allows candidates to:
- Upload multiple resumes with proper file storage in Supabase
- Extract data from CV files using AI/ML processing
- Manage resume metadata (primary status, fetch permissions)
- Analyze resume content for skills and recommendations
- Delete resumes with proper cleanup

## File Storage Structure

All files are stored in Supabase storage with the following structure:
```
candidate_resume/
├── {candidate_id}/
│   ├── {timestamp}_{random}_{filename}.pdf
│   ├── {timestamp}_{random}_{filename}.docx
│   └── ...
```

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer {jwt_token}
```

Only candidates can access these endpoints (role: 'candidate').

## API Endpoints

### 1. Upload Resume

**POST** `/api/candidate/resume/upload`

Upload a new resume file and create a database record.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `resumeFile` (File): Resume file (PDF, DOC, DOCX)
  - `resumeData` (string, optional): JSON string with metadata

#### Resume Data Schema
```json
{
  "is_allow_fetch": true,
  "is_primary": false,
  "original_filename": "my_resume.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf"
}
```

#### Response
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume_id": "uuid",
    "candidate_id": "uuid",
    "resume_url": "https://storage.url/path/to/file",
    "original_filename": "resume.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "is_primary": false,
    "is_allow_fetch": true,
    "uploaded_at": "2024-01-01T00:00:00.000Z",
    "storage_path": "candidate_id/filename",
    "public_url": "https://storage.url/path/to/file"
  }
}
```

#### File Validation
- **Max Size**: 10MB
- **Allowed Types**: PDF, DOC, DOCX
- **Storage**: Organized by candidate ID folders

### 2. Get Candidate Resumes

**GET** `/api/candidate/resume/upload`

Retrieve all resumes for the authenticated candidate.

#### Response
```json
{
  "success": true,
  "data": {
    "candidate_id": "uuid",
    "resumes": [
      {
        "id": "uuid",
        "candidate_id": "uuid",
        "resume_url": "https://storage.url/path/to/file",
        "original_filename": "resume.pdf",
        "file_size": 1024000,
        "file_type": "application/pdf",
        "is_primary": true,
        "is_allow_fetch": true,
        "uploaded_at": "2024-01-01T00:00:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total_count": 1,
    "primary_resume": {
      "id": "uuid",
      "is_primary": true,
      // ... resume object
    }
  }
}
```

### 3. Update Resume

**PUT** `/api/candidate/resume/upload`

Update resume metadata (primary status, fetch permissions).

#### Request
```json
{
  "resume_id": "uuid",
  "is_primary": true,
  "is_allow_fetch": true
}
```

#### Response
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "data": {
    "id": "uuid",
    "candidate_id": "uuid",
    "is_primary": true,
    "is_allow_fetch": true,
    "updated_at": "2024-01-01T00:00:00.000Z"
    // ... other resume fields
  }
}
```

#### Business Logic
- Setting `is_primary: true` automatically sets all other resumes to `is_primary: false`
- Primary resume URL is updated in the candidate table
- Only one resume can be primary at a time

### 4. Delete Resume

**DELETE** `/api/candidate/resume/upload`

Delete a resume file and database record.

#### Request
```json
{
  "resume_id": "uuid"
}
```

#### Response
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

#### Business Logic
- Deletes file from Supabase storage
- Removes database record
- If deleted resume was primary, automatically sets the most recent resume as primary
- If no resumes remain, clears candidate's resume_url

### 5. CV Extraction

**POST** `/api/candidate/cv-extraction`

Extract structured data from CV files using AI/ML processing.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `cvFile` (File): CV file (PDF, DOC, DOCX, JPG, PNG)
  - `extractionMethod` (string, optional): 'ai' | 'manual' | 'parsing' (default: 'ai')
  - `saveAsResume` (string, optional): 'true' | 'false' (default: 'false')
  - `setAsPrimary` (string, optional): 'true' | 'false' (default: 'false')

#### Response
```json
{
  "success": true,
  "message": "CV extraction completed successfully",
  "data": {
    "extraction_id": "ext_timestamp_random",
    "candidate_id": "uuid",
    "extracted_data": {
      "personal_info": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "City, Country",
        "linkedin": "linkedin.com/in/johndoe",
        "github": "github.com/johndoe",
        "website": "johndoe.com"
      },
      "experience": [
        {
          "title": "Senior Software Engineer",
          "company": "Tech Corp",
          "duration": "2020-2023",
          "description": "Led development of web applications",
          "skills": ["React", "Node.js", "AWS"]
        }
      ],
      "education": [
        {
          "degree": "Bachelor of Science",
          "institution": "University Name",
          "year": "2020",
          "field": "Computer Science"
        }
      ],
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "certifications": [
        {
          "name": "AWS Certified Developer",
          "issuer": "Amazon Web Services",
          "year": "2022"
        }
      ],
      "languages": ["English", "Spanish"],
      "projects": [
        {
          "name": "E-commerce Platform",
          "description": "Full-stack web application",
          "technologies": ["React", "Node.js", "MongoDB"]
        }
      ]
    },
    "confidence_score": 0.85,
    "extraction_method": "ai",
    "created_at": "2024-01-01T00:00:00.000Z",
    "resume_id": "uuid", // Only if saveAsResume=true
    "resume_url": "https://storage.url/path/to/file" // Only if saveAsResume=true
  }
}
```

#### File Validation
- **Max Size**: 15MB
- **Allowed Types**: PDF, DOC, DOCX, JPG, PNG
- **Storage**: Same bucket as resumes, organized by candidate ID

### 6. Resume Analysis

**POST** `/api/candidate/resume/analyze`

Analyze resume content for skills, experience, and recommendations.

#### Request
```json
{
  "resume_id": "uuid"
}
```

#### Response
```json
{
  "success": true,
  "message": "Resume analysis completed successfully",
  "data": {
    "resume_id": "uuid",
    "candidate_id": "uuid",
    "analysis": {
      "skills_found": [
        "JavaScript", "React", "Node.js", "Python", "SQL",
        "Git", "Docker", "AWS", "TypeScript", "MongoDB"
      ],
      "experience_summary": "5+ years of full-stack development experience with focus on modern web technologies and cloud platforms.",
      "education_summary": "Bachelor's degree in Computer Science with relevant certifications in cloud technologies.",
      "overall_score": 85,
      "recommendations": [
        "Consider adding more DevOps skills like Kubernetes and CI/CD",
        "Include specific metrics and achievements in work experience",
        "Add more recent certifications to stay current with industry trends",
        "Consider adding soft skills like leadership and communication"
      ]
    },
    "analyzed_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Resume Management (Update)

**PUT** `/api/candidate/resume/manage`

Alternative endpoint for updating resume metadata.

#### Request/Response
Same as Update Resume endpoint above.

### 8. Resume Management (Delete)

**DELETE** `/api/candidate/resume/manage`

Alternative endpoint for deleting resumes.

#### Request/Response
Same as Delete Resume endpoint above.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors, missing fields)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (wrong user role)
- **404**: Not Found (resume not found, candidate not found)
- **500**: Internal Server Error

### Common Error Messages

- `"Authentication required. Please login again."`
- `"Invalid or expired token. Please login again."`
- `"Access denied. Only candidates can upload resumes."`
- `"Resume file is required"`
- `"Only PDF, DOC, and DOCX files are allowed for resumes"`
- `"Resume file size must be less than 10MB"`
- `"Candidate profile not found. Create profile first."`
- `"Resume not found or access denied"`
- `"Failed to upload resume"`

## Database Schema Integration

### Resume Table Updates
When a resume is uploaded or updated:
1. Resume record is created/updated in `resume` table
2. If `is_primary: true`, all other resumes for the candidate are set to `is_primary: false`
3. If primary resume, the `candidate.resume_url` field is updated with the new URL

### Candidate Table Updates
The `candidate` table's `resume_url` field is automatically maintained:
- Updated when a resume is set as primary
- Cleared when the last resume is deleted
- Updated when primary resume is deleted (set to next most recent resume)

## File Storage Details

### Supabase Storage Configuration
- **Bucket**: `candidate_resume`
- **Public Access**: Yes (with signed URLs)
- **File Organization**: `{candidate_id}/{timestamp}_{random}_{filename}.{ext}`
- **Cache Control**: 3600 seconds
- **Max File Size**: 15MB (to support both resumes and CV images)

### File Naming Convention
```
{timestamp}_{randomString}_{sanitizedOriginalName}.{extension}
```

Example: `1704067200000_a1b2c3_john_doe_resume.pdf`

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Only candidates can access their own resumes
3. **File Validation**: Strict file type and size validation
4. **Storage Security**: Files stored in candidate-specific folders
5. **Database Security**: Candidate ID validation on all operations

## Integration Examples

### Upload Resume with JavaScript
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

### Extract CV Data
```javascript
const formData = new FormData();
formData.append('cvFile', file);
formData.append('extractionMethod', 'ai');
formData.append('saveAsResume', 'true');
formData.append('setAsPrimary', 'true');

const response = await fetch('/api/candidate/cv-extraction', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Future Enhancements

1. **AI Integration**: Replace placeholder AI functions with real OpenAI/ML services
2. **Resume Versioning**: Track resume versions and changes
3. **Batch Operations**: Support multiple file uploads
4. **Resume Templates**: Generate resumes from extracted data
5. **Analytics**: Track resume performance and views
6. **Collaboration**: Share resumes with recruiters
7. **Resume Optimization**: AI-powered resume improvement suggestions

## Support

For technical support or questions about the Resume Management API, please refer to the main project documentation or contact the development team.

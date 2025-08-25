# Candidate Profile API Documentation

## Overview
The Candidate Profile API provides endpoints for creating, updating, and retrieving candidate profiles with resume upload and AI-powered data extraction using Google Gemini API.

## Base URL
```
POST /api/candidate/profile
PUT /api/candidate/profile
GET /api/candidate/profile
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Candidate Profile (POST)

Creates a new candidate profile with optional resume upload and AI data extraction.

**URL:** `POST /api/candidate/profile`

**Request Body:** FormData
- `file` (optional): PDF resume file (max 10MB)
- `profileData` (optional): JSON string with manual profile data

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', resumeFile); // PDF file
formData.append('profileData', JSON.stringify({
  basic_info: {
    first_name: "John",
    last_name: "Doe",
    title: "Software Engineer",
    current_position: "Senior Developer",
    industry: "Technology"
  }
}));

const response = await fetch('/api/candidate/profile', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate profile created successfully",
  "data": {
    "candidate_id": "uuid",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "title": "Software Engineer",
      "current_position": "Senior Developer",
      "industry": "Technology",
      "years_of_experience": 5
    },
    "created_records": {
      "workExperiences": ["uuid1", "uuid2"],
      "educations": ["uuid3"],
      "certificates": ["uuid4"],
      "projects": ["uuid5"],
      "awards": ["uuid6"],
      "volunteering": ["uuid7"],
      "skills": ["uuid8", "uuid9"],
      "accomplishments": ["uuid10"]
    },
    "resume": {
      "id": "uuid11",
      "filename": "resume.pdf",
      "file_size": 1024000,
      "file_type": "application/pdf"
    },
    "extracted_data": {
      "work_experiences_count": 2,
      "educations_count": 1,
      "skills_count": 2,
      "projects_count": 1
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User is not a candidate
- `409 Conflict`: Profile already exists
- `500 Internal Server Error`: Server error

### 2. Update Candidate Profile (PUT)

Updates an existing candidate profile.

**URL:** `PUT /api/candidate/profile`

**Request Body:** JSON
```json
{
  "profileData": {
    "first_name": "John",
    "last_name": "Doe",
    "title": "Senior Software Engineer",
    "current_position": "Lead Developer",
    "industry": "Technology",
    "bio": "Experienced software engineer...",
    "about": "Passionate about...",
    "location": "New York, NY",
    "phone1": "+1234567890",
    "phone2": "+0987654321",
    "personal_website": "https://johndoe.com",
    "github_url": "https://github.com/johndoe",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "years_of_experience": 6
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate profile updated successfully",
  "data": {
    "candidate_id": "uuid",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "title": "Senior Software Engineer",
      "current_position": "Lead Developer",
      "industry": "Technology",
      "years_of_experience": 6
    }
  }
}
```

### 3. Get Candidate Profile (GET)

Retrieves the candidate profile with all related data.

**URL:** `GET /api/candidate/profile`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "title": "Senior Software Engineer",
    "current_position": "Lead Developer",
    "industry": "Technology",
    "bio": "Experienced software engineer...",
    "about": "Passionate about...",
    "location": "New York, NY",
    "phone1": "+1234567890",
    "phone2": "+0987654321",
    "personal_website": "https://johndoe.com",
    "github_url": "https://github.com/johndoe",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "years_of_experience": 6,
    "work_experiences": [...],
    "educations": [...],
    "certificates": [...],
    "projects": [...],
    "awards": [...],
    "volunteering": [...],
    "skills": [...],
    "accomplishments": [...],
    "resumes": [...],
    "languages": [...]
  }
}
```

## Resume Processing

### Supported File Types
- **PDF only** (application/pdf)
- **Maximum size**: 10MB

### AI Data Extraction
The API uses Google Gemini AI to extract the following information from resumes:

1. **Basic Information**
   - First name, last name
   - Title, current position
   - Industry, bio, about
   - Location, phone numbers
   - Personal website, GitHub, LinkedIn, portfolio URLs
   - Years of experience

2. **Work Experience**
   - Job title, company
   - Employment type (full_time, part_time, contract, internship, freelance, volunteer)
   - Start/end dates, location
   - Job description

3. **Education**
   - Degree/diploma, university/school
   - Field of study, start/end dates
   - Grade

4. **Certificates**
   - Name, issuing authority
   - Issue/expiry dates
   - Credential ID, URL, description

5. **Projects**
   - Name, description, role
   - Start/end dates, technologies
   - Tools, methodologies
   - URLs, media files

6. **Skills**
   - Skill name, category
   - Proficiency level (0-100)

7. **Awards**
   - Title, offered by
   - Associated with, date
   - Description, media URL

8. **Volunteering**
   - Role, institution
   - Cause, start/end dates
   - Description

9. **Accomplishments**
   - Title, description
   - Associated work experience

## Data Types

### Employment Types
- `full_time`
- `part_time`
- `contract`
- `internship`
- `freelance`
- `volunteer`

### Date Format
All dates should be in `YYYY-MM-DD` format.

### Skill Proficiency
Skills proficiency is measured on a scale of 0-100.

## Error Handling

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Rate Limiting
Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

1. **Authentication**: JWT tokens are required for all endpoints
2. **File Validation**: Only PDF files are accepted
3. **File Size Limits**: Maximum 10MB file size
4. **Role-based Access**: Only candidates can access these endpoints
5. **Input Validation**: All input data is validated before processing

## Environment Variables

Required environment variables:
```bash
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

## Dependencies

The API requires the following packages:
- `@google/generative-ai`: For AI-powered resume processing
- `@prisma/client`: For database operations
- `jsonwebtoken`: For JWT authentication
- `next`: Next.js framework

## Database Schema

The API works with the following Prisma models:
- `User`
- `Candidate`
- `WorkExperience`
- `Education`
- `Certificate`
- `Project`
- `Award`
- `Volunteering`
- `Skill`
- `CandidateSkill`
- `Accomplishment`
- `Resume`
- `Language`

## Example Usage

### Frontend Integration
```javascript
// Create profile with resume
async function createProfileWithResume(resumeFile, profileData) {
  const formData = new FormData();
  if (resumeFile) {
    formData.append('file', resumeFile);
  }
  if (profileData) {
    formData.append('profileData', JSON.stringify(profileData));
  }

  const response = await fetch('/api/candidate/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
}

// Update profile
async function updateProfile(profileData) {
  const response = await fetch('/api/candidate/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profileData })
  });

  return response.json();
}

// Get profile
async function getProfile() {
  const response = await fetch('/api/candidate/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
}
```

## Notes

1. **Resume Processing**: The AI extraction works best with well-formatted PDF resumes
2. **Data Accuracy**: While AI extraction is powerful, manual verification of extracted data is recommended
3. **File Storage**: Currently, the API creates database records but doesn't handle actual file storage. Implement cloud storage integration for production
4. **Performance**: Large resumes may take longer to process due to AI analysis
5. **Fallback**: If AI extraction fails, the API will still create the profile with any manually provided data

# Candidate Profile API Setup & Usage

## Overview
This API provides comprehensive candidate profile management with AI-powered resume parsing using Google Gemini. It allows candidates to create profiles by uploading resumes or manually entering data, with automatic extraction of professional information.

## Features
- ✅ Resume upload (PDF only, max 10MB)
- ✅ AI-powered data extraction using Google Gemini
- ✅ Manual profile data input
- ✅ Complete CRUD operations for candidate profiles
- ✅ Automatic creation of related records (work experience, education, skills, etc.)
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Comprehensive error handling
- ✅ Type-safe implementation using Prisma schema

## Quick Start

### 1. Install Dependencies
```bash
npm install @google/generative-ai
```

### 2. Environment Setup
Create a `.env` file in the root directory with:
```bash
# Required
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_connection_string
DIRECT_URL=your_direct_database_connection_string

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing
3. Generate an API key
4. Add it to your `.env` file

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if any)
npx prisma migrate dev

# Seed database (if needed)
npx prisma db seed
```

## API Endpoints

### POST `/api/candidate/profile`
**Create candidate profile with resume upload and AI extraction**

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `file` (optional): PDF resume file
  - `profileData` (optional): JSON string with manual data

**Example:**
```javascript
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('profileData', JSON.stringify({
  basic_info: {
    first_name: "John",
    last_name: "Doe",
    title: "Software Engineer"
  }
}));

const response = await fetch('/api/candidate/profile', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### PUT `/api/candidate/profile`
**Update existing candidate profile**

**Request:**
- Method: `PUT`
- Content-Type: `application/json`
- Body: `{ "profileData": { ... } }`

### GET `/api/candidate/profile`
**Retrieve candidate profile with all related data**

**Request:**
- Method: `GET`
- Headers: `Authorization: Bearer <token>`

## Data Structure

### Basic Info
```typescript
interface BasicInfo {
  first_name: string;
  last_name: string;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  bio: string | null;
  about: string | null;
  location: string | null;
  phone1: string | null;
  phone2: string | null;
  personal_website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
}
```

### Work Experience
```typescript
interface WorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  location: string | null;
  description: string | null;
}
```

### Skills
```typescript
interface Skill {
  name: string;
  category: string | null;
  proficiency: number | null; // 0-100
}
```

## Resume Processing

### Supported Formats
- **File Type**: PDF only
- **Max Size**: 10MB
- **AI Model**: Google Gemini 1.5 Flash

### Extracted Information
The AI automatically extracts:
1. Personal information (name, contact, location)
2. Professional summary and experience
3. Work history with dates and descriptions
4. Education details
5. Skills and certifications
6. Projects and achievements
7. Volunteering experience

### AI Prompt Engineering
The API uses a carefully crafted prompt to ensure:
- Consistent data structure
- Proper date formatting
- Enum value validation
- Complete field extraction
- Error-free JSON output

## Authentication & Security

### JWT Token Requirements
- Valid JWT token in Authorization header
- Token must contain user role as 'candidate'
- Token must not be expired

### Role-based Access
- Only users with `candidate` role can access
- Employers and other roles are blocked
- Unauthorized access returns 403 Forbidden

### Input Validation
- File type validation (PDF only)
- File size limits (10MB max)
- Required field validation
- Data type validation
- SQL injection prevention via Prisma

## Error Handling

### Common Error Scenarios
```typescript
// 400 Bad Request
{ error: "First name and last name are required" }

// 401 Unauthorized
{ error: "Authorization header required" }

// 403 Forbidden
{ error: "Access denied. Only candidates can create profiles." }

// 409 Conflict
{ error: "Candidate profile already exists. Use PUT method to update." }

// 500 Internal Server Error
{ error: "Failed to create candidate profile", details: "..." }
```

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

## Database Integration

### Prisma Models Used
- `User` - User authentication and basic info
- `Candidate` - Main candidate profile
- `WorkExperience` - Job history
- `Education` - Academic background
- `Certificate` - Professional certifications
- `Project` - Portfolio projects
- `Award` - Achievements and recognition
- `Volunteering` - Community service
- `Skill` - Skills database
- `CandidateSkill` - Candidate-skill relationships
- `Accomplishment` - Professional achievements
- `Resume` - Resume file metadata

### Transaction Handling
- All related records are created in sequence
- Database connections are properly managed
- Prisma client is disconnected after operations

## Performance Considerations

### Resume Processing
- Large PDFs may take longer to process
- AI extraction is asynchronous
- File size limits prevent memory issues

### Database Operations
- Efficient queries with proper indexing
- Batch operations for related records
- Connection pooling via Prisma

### Caching
- No built-in caching (consider Redis for production)
- Static data could be cached
- AI responses are not cached

## Testing

### Test File
Use `test-candidate-profile-api.http` for testing:
1. Replace `{{token}}` with valid JWT
2. Ensure PDF file exists for resume tests
3. Test all endpoints with various scenarios

### Test Scenarios
- ✅ Valid resume upload
- ✅ Manual profile creation
- ✅ Profile updates
- ✅ Invalid authentication
- ✅ Wrong user roles
- ✅ Missing required fields
- ✅ File validation errors

## Production Considerations

### Security Enhancements
- Implement rate limiting
- Add request validation middleware
- Use HTTPS in production
- Implement API key rotation

### File Storage
- Integrate with cloud storage (AWS S3, Google Cloud Storage)
- Implement file compression
- Add virus scanning
- Set up CDN for file delivery

### Monitoring
- Add logging and metrics
- Implement health checks
- Monitor API response times
- Track AI extraction success rates

### Scaling
- Consider serverless deployment
- Implement database connection pooling
- Add caching layers
- Use load balancers

## Troubleshooting

### Common Issues

#### 1. Gemini API Key Error
```
Error: Gemini API key not configured
```
**Solution**: Ensure `NEXT_PUBLIC_GEMINI_API_KEY` is set in `.env`

#### 2. Database Connection Error
```
Error: Failed to create candidate profile
```
**Solution**: Check `DATABASE_URL` and database connectivity

#### 3. JWT Verification Failed
```
Error: Token verification failed
```
**Solution**: Verify JWT_SECRET and token validity

#### 4. File Upload Error
```
Error: Only PDF files are allowed
```
**Solution**: Ensure file is PDF format and under 10MB

#### 5. AI Extraction Failed
```
Error: Invalid AI response format
```
**Solution**: Check Gemini API quota and response format

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=prisma:*
```

## Support

### Documentation
- Full API docs: `CANDIDATE_PROFILE_API.md`
- Schema reference: `prisma/schema.prisma`
- Test examples: `test-candidate-profile-api.http`

### Dependencies
- `@google/generative-ai`: AI resume processing
- `@prisma/client`: Database operations
- `jsonwebtoken`: Authentication
- `next`: Framework

### Version Compatibility
- Node.js: 18+
- Next.js: 15+
- Prisma: 6+
- TypeScript: 5+

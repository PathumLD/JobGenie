# Candidate Profile Update API

## Overview
The Candidate Profile Update API allows candidates to update their existing profiles with comprehensive information including profile image upload to Supabase storage. This API supports partial updates, meaning candidates can update only specific sections of their profile without affecting other data.

## Purpose
- Update existing candidate profile information
- Upload and manage profile images
- Update related records (work experience, education, skills, etc.)
- Calculate profile completion percentage automatically
- Support both partial and full profile updates

## Endpoints

### PUT `/api/candidate/profile/update-profile`
**Update candidate profile with optional image upload**

### GET `/api/candidate/profile/update-profile`
**Retrieve current candidate profile with all related data**

## Authentication
- **Required**: JWT token in Authorization header
- **Role**: Only candidates can access
- **Format**: `Authorization: Bearer <your_jwt_token>`

## Request Structure

### PUT Request
- **Method**: PUT
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `profileImage` (optional): Image file for profile picture
  - `profileData` (required): JSON string with profile update data

### Profile Data Structure
```typescript
interface UpdateProfileData {
  basic_info?: UpdateBasicInfo;
  work_experiences?: UpdateWorkExperience[];
  educations?: UpdateEducation[];
  certificates?: UpdateCertificate[];
  projects?: UpdateProject[];
  skills?: UpdateSkill[];
  awards?: UpdateAward[];
  volunteering?: UpdateVolunteering[];
  languages?: UpdateLanguage[];
  accomplishments?: UpdateAccomplishment[];
}
```

## Data Fields

### Basic Information
All fields in `basic_info` are optional and follow the exact schema structure:

```typescript
interface UpdateBasicInfo {
  first_name?: string;                    // First name
  last_name?: string;                     // Last name
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;                 // YYYY-MM-DD format
  title?: string;                         // Professional title
  current_position?: string;              // Current job position
  industry?: string;                      // Industry sector
  bio?: string;                           // Short biography
  about?: string;                         // Detailed about section
  country?: string;                       // Country
  city?: string;                          // City
  location?: string;                      // Full location
  address?: string;                       // Detailed address
  phone1?: string;                        // Primary phone
  phone2?: string;                        // Secondary phone
  personal_website?: string;              // Personal website URL
  nic?: string;                           // National ID
  passport?: string;                      // Passport number
  remote_preference?: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  years_of_experience?: number;           // Years of experience
  expected_salary_min?: number;           // Minimum expected salary
  expected_salary_max?: number;           // Maximum expected salary
  currency?: string;                      // Salary currency (default: LKR)
  availability_status?: 'available' | 'open_to_opportunities' | 'not_looking';
  availability_date?: string;             // YYYY-MM-DD format
  github_url?: string;                    // GitHub profile URL
  linkedin_url?: string;                  // LinkedIn profile URL
  resume_url?: string;                    // Resume file URL
  professional_summary?: string;           // Professional summary
  total_years_experience?: number;        // Total years of experience
  open_to_relocation?: boolean;           // Willing to relocate
  willing_to_travel?: boolean;            // Willing to travel
  security_clearance?: boolean;           // Security clearance status
  disability_status?: string;             // Disability status
  veteran_status?: string;                // Veteran status
  pronouns?: string;                      // Preferred pronouns
  salary_visibility?: 'confidential' | 'range_only' | 'exact' | 'negotiable';
  notice_period?: number;                 // Notice period in days
  work_authorization?: 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other';
  visa_assistance_needed?: boolean;       // Need visa sponsorship
  work_availability?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer';
  interview_ready?: boolean;              // Ready for interviews
  pre_qualified?: boolean;                // Pre-qualified status
}
```

### Work Experience
```typescript
interface UpdateWorkExperience {
  id?: string;                            // For existing records
  title?: string;                         // Job title
  company?: string;                       // Company name
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current?: boolean;                   // Current position
  start_date?: string;                    // YYYY-MM-DD format
  end_date?: string | null;               // YYYY-MM-DD format
  location?: string;                      // Job location
  description?: string;                   // Job description
  skill_ids?: string[];                   // Related skill IDs
  media_url?: string;                     // Media URL
}
```

### Education
```typescript
interface UpdateEducation {
  id?: string;                            // For existing records
  degree_diploma?: string;                // Degree or diploma
  university_school?: string;             // Institution name
  field_of_study?: string;                // Field of study
  description?: string;                   // Description
  start_date?: string;                    // YYYY-MM-DD format
  end_date?: string | null;               // YYYY-MM-DD format
  grade?: string;                         // Grade or GPA
  activities_societies?: string;          // Activities and societies
  skill_ids?: string[];                   // Related skill IDs
  media_url?: string;                     // Media URL
}
```

### Skills
```typescript
interface UpdateSkill {
  id?: string;                            // For existing records
  name?: string;                          // Skill name
  category?: string;                      // Skill category
  description?: string;                   // Skill description
  proficiency?: number;                   // Proficiency level (0-100)
}
```

### Languages
```typescript
interface UpdateLanguage {
  id?: string;                            // For existing records
  language?: string;                      // Language name
  is_native?: boolean;                    // Native language
  oral_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
  written_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
}
```

## Image Upload

### Profile Image Requirements
- **File Types**: Image files only (jpg, png, gif, webp, etc.)
- **Max Size**: 5MB
- **Storage**: Supabase storage bucket `candidate_profile_image`
- **File Naming**: `{candidate_id}_{timestamp}.{extension}`

### Image Upload Process
1. **Validation**: File type and size validation
2. **Upload**: File uploaded to Supabase storage
3. **URL Generation**: Public URL generated and stored in database
4. **Update**: Profile image URL updated in candidate record

## Profile Completion Calculation

### Automatic Calculation
The API automatically calculates profile completion percentage based on:

**Required Fields (Weight: 2x)**
- First name, last name
- Title, current position, industry
- Bio, location, phone1
- Years of experience

**Optional Fields (Weight: 1x)**
- About, country, city, address
- Phone2, personal website
- GitHub, LinkedIn URLs
- Professional summary
- Gender, date of birth
- Remote preference, experience level

### Completion Status
- **Profile marked as completed** when percentage >= 80%
- **Percentage range**: 0-100%
- **Real-time calculation** on each update

## Response Structure

### Success Response (200)
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
      "profile_image_url": "https://supabase-url.com/profile.jpg",
      "profile_completion_percentage": 85,
      "completedProfile": true
    },
    "updated_records": {
      "workExperiences": ["uuid1", "uuid2"],
      "educations": ["uuid3"],
      "skills": ["uuid4", "uuid5"],
      "languages": ["uuid6"]
    },
    "profile_image": {
      "uploaded": true,
      "url": "https://supabase-url.com/profile.jpg",
      "filename": "profile.jpg",
      "size": 1024000
    }
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid data format or image type
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User is not a candidate
- `404 Not Found`: Candidate profile doesn't exist
- `500 Internal Server Error`: Server or upload error

## Usage Examples

### 1. Update Basic Information Only
```javascript
const formData = new FormData();
formData.append('profileData', JSON.stringify({
  basic_info: {
    first_name: "John",
    last_name: "Doe",
    title: "Senior Software Engineer",
    current_position: "Lead Developer",
    industry: "Technology",
    bio: "Updated bio with new information"
  }
}));

const response = await fetch('/api/candidate/profile/update-profile', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 2. Update with Profile Image
```javascript
const formData = new FormData();
formData.append('profileImage', imageFile);
formData.append('profileData', JSON.stringify({
  basic_info: {
    title: "Lead Software Engineer",
    years_of_experience: 7
  }
}));

const response = await fetch('/api/candidate/profile/update-profile', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 3. Update Work Experience
```javascript
const formData = new FormData();
formData.append('profileData', JSON.stringify({
  work_experiences: [
    {
      id: "existing-id", // Update existing record
      title: "Lead Software Engineer",
      description: "Updated job description"
    },
    {
      // Create new record (no id)
      title: "Senior Developer",
      company: "New Company",
      employment_type: "full_time",
      is_current: false,
      start_date: "2023-01-01",
      end_date: "2023-12-31"
    }
  ]
}));

const response = await fetch('/api/candidate/profile/update-profile', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 4. Update Skills
```javascript
const formData = new FormData();
formData.append('profileData', JSON.stringify({
  skills: [
    {
      id: "existing-skill-id", // Update existing skill
      proficiency: 95
    },
    {
      // Create new skill
      name: "TypeScript",
      category: "Programming Languages",
      description: "Advanced TypeScript with generics",
      proficiency: 85
    }
  ]
}));

const response = await fetch('/api/candidate/profile/update-profile', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## Partial Updates

### Key Features
- **Selective Updates**: Only provided fields are updated
- **Existing Records**: Use `id` field to update existing records
- **New Records**: Omit `id` field to create new records
- **No Data Loss**: Unspecified fields remain unchanged

### Update Strategies
1. **Full Profile Update**: Provide all sections with complete data
2. **Section Update**: Update only specific sections
3. **Field Update**: Update only specific fields within sections
4. **Incremental Update**: Add new records without affecting existing ones

## Security Features

### Authentication & Authorization
- JWT token validation
- Role-based access control (candidates only)
- Token expiration checking

### File Security
- File type validation (images only)
- File size limits (5MB max)
- Secure file naming convention
- Supabase storage security

### Data Validation
- Schema compliance checking
- Enum value validation
- Date format validation
- Required field validation

## Error Handling

### Common Error Scenarios
1. **Invalid File Type**: Only image files accepted
2. **File Too Large**: Must be under 5MB
3. **Profile Not Found**: Create profile first
4. **Invalid Token**: JWT authentication required
5. **Wrong Role**: Only candidates can access
6. **Upload Failure**: Supabase storage issues

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Performance Considerations

### Database Operations
- Efficient Prisma queries
- Transaction handling for related records
- Connection management
- Index utilization

### File Upload
- Stream processing for large files
- Asynchronous upload handling
- Error recovery mechanisms
- Storage optimization

### Response Optimization
- Selective data inclusion
- Pagination for large datasets
- Caching considerations
- Response compression

## Testing

### Test Scenarios
- ✅ Valid profile updates
- ✅ Image upload and management
- ✅ Partial updates
- ✅ Related record updates
- ✅ Error handling
- ✅ Authentication validation
- ✅ File validation
- ✅ Profile completion calculation

### Test File
Use the provided test file:
```
test-profile-update-api.http
```

## Environment Variables

### Required Configuration
```bash
# JWT
JWT_SECRET=your_jwt_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

## Dependencies

### Required Packages
- `@supabase/supabase-js`: Supabase client
- `@prisma/client`: Database operations
- `jsonwebtoken`: JWT authentication
- `next`: Next.js framework

## Notes

### Important Considerations
- **Profile Must Exist**: Candidate profile must be created before updating
- **Image Storage**: Images are stored in Supabase storage bucket
- **Partial Updates**: Only provided fields are modified
- **Completion Tracking**: Profile completion is automatically calculated
- **Data Integrity**: All updates maintain data consistency
- **Audit Trail**: Updated timestamps are automatically managed

### Best Practices
1. **Validate Data**: Ensure data format before sending
2. **Handle Errors**: Implement proper error handling
3. **Image Optimization**: Compress images before upload
4. **Batch Updates**: Group related updates together
5. **Progress Tracking**: Show upload progress to users
6. **Fallback Handling**: Handle upload failures gracefully

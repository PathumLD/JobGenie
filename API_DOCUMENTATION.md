# Job Genie API Documentation

## Candidate Profile API

### Get Candidate Profile

Retrieves a comprehensive candidate profile organized in LinkedIn-style sections.

**Endpoint:** `GET /api/candidate/profile/{id}`

**URL Parameters:**
- `id` (string, required): The candidate's user ID (UUID)

**Response Format:**
```json
{
  "success": boolean,
  "message": string,
  "data": {
    "candidate_id": string,
    "sections": CandidateProfileSection[],
    "profile_summary": ProfileSummary
  }
}
```

**Profile Sections:**

#### 1. Basic Information Section
- **ID:** `basic_info`
- **Title:** "Basic Information"
- **Order:** 1
- **Data includes:** Profile image, name, title, current position, industry, location, contact info, social links, bio, professional summary, availability status, experience level, remote preferences, work authorization, etc.

#### 2. About Section
- **ID:** `about`
- **Title:** "About"
- **Order:** 2
- **Data includes:** Personal details, gender, date of birth, pronouns, disability status, veteran status, security clearance, salary expectations, etc.

#### 3. Work Experience Section
- **ID:** `experience`
- **Title:** "Work Experience"
- **Order:** 3
- **Data includes:** Job history with company details, employment type, dates, location, description, skills used, and accomplishments

#### 4. Education Section
- **ID:** `education`
- **Title:** "Education"
- **Order:** 4
- **Data includes:** Degrees, institutions, field of study, dates, grades, activities, and skills gained

#### 5. Skills Section
- **ID:** `skills`
- **Title:** "Skills"
- **Order:** 5
- **Data includes:** Skill names, categories, proficiency levels, years of experience, and sources

#### 6. Projects Section
- **ID:** `projects`
- **Title:** "Projects"
- **Order:** 6
- **Data includes:** Project details, technologies used, tools, methodologies, responsibilities, and skills gained

#### 7. Certifications Section
- **ID:** `certificates`
- **Title:** "Certifications"
- **Order:** 7
- **Data includes:** Certificate names, issuing authorities, dates, credential IDs, and descriptions

#### 8. Languages Section
- **ID:** `languages`
- **Title:** "Languages"
- **Order:** 8
- **Data includes:** Language names, native status, oral and written proficiency levels

#### 9. Awards Section
- **ID:** `awards`
- **Title:** "Awards & Recognition"
- **Order:** 9
- **Data includes:** Award titles, associated organizations, dates, descriptions, and related skills

#### 10. Volunteering Section
- **ID:** `volunteering`
- **Title:** "Volunteering"
- **Order:** 10
- **Data includes:** Volunteer roles, institutions, causes, dates, and descriptions

#### 11. Accomplishments Section
- **ID:** `accomplishments`
- **Title:** "Accomplishments"
- **Order:** 11
- **Data includes:** Achievement titles, descriptions, and creation dates

**Profile Summary:**
```json
{
  "total_experience_years": number,
  "total_projects": number,
  "total_certificates": number,
  "total_skills": number,
  "profile_completion_percentage": number,
  "is_approved": boolean
}
```

**HTTP Status Codes:**
- `200 OK`: Profile retrieved successfully
- `400 Bad Request`: Missing candidate ID parameter
- `404 Not Found`: Candidate not found
- `500 Internal Server Error`: Server error

**Example Request:**
```bash
GET /api/candidate/profile/123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "message": "Candidate profile retrieved successfully",
  "data": {
    "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
    "sections": [
      {
        "id": "basic_info",
        "title": "Basic Information",
        "order": 1,
        "data": {
          "type": "basic_info",
          "first_name": "John",
          "last_name": "Doe",
          "title": "Senior Software Engineer",
          "current_position": "Full Stack Developer",
          "industry": "Technology",
          "location": "New York, NY",
          "experience_level": "senior",
          "years_of_experience": 8,
          "remote_preference": "hybrid",
          "availability_status": "available"
        }
      }
    ],
    "profile_summary": {
      "total_experience_years": 8,
      "total_projects": 15,
      "total_certificates": 5,
      "total_skills": 25,
      "profile_completion_percentage": 85,
      "is_approved": true
    }
  }
}
```

**Error Response Example:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Candidate not found"
}
```

**Notes:**
- Only sections with data are included in the response
- Sections are ordered by importance and logical flow
- All dates are returned in ISO format
- Skills are ordered by years of experience (descending)
- Work experiences are ordered by start date (descending)
- Education is ordered by start date (descending)
- Projects are ordered by start date (descending)
- Certificates are ordered by issue date (descending)
- Languages are ordered with native languages first
- Awards are ordered by date (descending)
- Volunteering is ordered by start date (descending)
- Accomplishments are ordered by creation date (descending)

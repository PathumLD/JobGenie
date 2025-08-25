# CV Data Extraction API

## Overview
The CV Data Extraction API is designed to extract professional information from uploaded resumes using Google Gemini AI. This API **ONLY extracts data** and does not create any database records. The extracted data is returned to the frontend for form population, allowing candidates to review and modify the information before creating their profile.

## Purpose
- Extract structured data from PDF resumes
- Populate form fields automatically
- Allow candidates to review and edit extracted data
- Prepare data for later profile creation

## Endpoint
```
POST /api/candidate/profile/extract-cv
```

## Authentication
- **Required**: JWT token in Authorization header
- **Role**: Only candidates can access
- **Format**: `Authorization: Bearer <your_jwt_token>`

## Request
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: PDF resume file (required, max 10MB)

## Response Structure

### Success Response (200)
```json
{
  "success": true,
  "message": "CV data extracted successfully",
  "data": {
    "extracted_data": {
      "basic_info": { ... },
      "work_experiences": [ ... ],
      "educations": [ ... ],
      "skills": [ ... ],
      "projects": [ ... ],
      "certificates": [ ... ],
      "awards": [ ... ],
      "volunteering": [ ... ],
      "languages": [ ... ],
      "accomplishments": [ ... ]
    },
    "file_info": {
      "name": "resume.pdf",
      "size": 1024000,
      "type": "application/pdf"
    },
    "extraction_summary": {
      "work_experiences_count": 3,
      "educations_count": 2,
      "skills_count": 15,
      "projects_count": 5,
      "certificates_count": 2,
      "awards_count": 1,
      "volunteering_count": 1,
      "languages_count": 3,
      "accomplishments_count": 8
    }
  }
}
```

### Error Responses
- `400 Bad Request`: Missing file or invalid file type
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User is not a candidate
- `500 Internal Server Error`: AI processing or server error

## Data Extraction

### What Gets Extracted
1. **Basic Information**
   - Personal details (name, contact, location)
   - Professional summary and experience
   - Preferences and availability

2. **Work Experience**
   - Job titles and companies
   - Employment periods and types
   - Job descriptions and locations

3. **Education**
   - Degrees and institutions
   - Fields of study and grades
   - Academic periods

4. **Skills**
   - Technical and soft skills
   - Proficiency levels (0-100)
   - Skill categories

5. **Projects**
   - Project names and descriptions
   - Technologies and tools used
   - Roles and responsibilities

6. **Certificates & Awards**
   - Professional certifications
   - Recognition and achievements
   - Issuing authorities and dates

7. **Volunteering & Languages**
   - Community service experience
   - Language proficiencies
   - Cultural competencies

8. **Accomplishments**
   - Professional achievements
   - Milestones and successes
   - Impact and results

### AI Processing
- **Model**: Google Gemini 1.5 Flash
- **Input**: PDF resume files
- **Output**: Structured JSON data
- **Validation**: Schema-compliant data types

## Console Logging

The API provides comprehensive console logging for debugging and monitoring:

```
🎯 EXTRACTED CV DATA SUMMARY:
=====================================

📋 BASIC INFORMATION:
Name: John Doe
Title: Software Engineer
Current Position: Senior Developer
Industry: Technology
Location: New York, NY
Years of Experience: 5
Phone: +1234567890
Email: john@example.com

💼 WORK EXPERIENCE (3 positions):
  1. Senior Software Engineer at Tech Corp
     Period: 2022-01-01 - Present
     Type: full_time, Location: New York, NY
  2. Software Engineer at Startup Inc
     Period: 2020-03-01 - 2021-12-31
     Type: full_time, Location: San Francisco, CA

🎓 EDUCATION (2 entries):
  1. Bachelor of Science in Computer Science
     Institution: University of Technology
     Period: 2016-09-01 - 2020-05-01
     Grade: 3.8/4.0

🛠️ SKILLS (15 skills):
  1. JavaScript (Programming Languages) - Proficiency: 90%
  2. React (Frontend Frameworks) - Proficiency: 85%
  3. Node.js (Backend Technologies) - Proficiency: 80%

=====================================
📊 EXTRACTION COMPLETE - Data ready for form population
=====================================
```

## Usage Flow

### 1. Frontend Integration
```javascript
// Upload resume and extract data
async function extractCVData(resumeFile) {
  const formData = new FormData();
  formData.append('file', resumeFile);

  const response = await fetch('/api/candidate/profile/extract-cv', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    // Populate form fields with extracted data
    populateFormFields(result.data.extracted_data);
    
    // Show extraction summary
    showExtractionSummary(result.data.extraction_summary);
  }
}
```

### 2. Form Population
```javascript
// Populate form fields with extracted data
function populateFormFields(extractedData) {
  // Basic info
  document.getElementById('first_name').value = extractedData.basic_info.first_name;
  document.getElementById('last_name').value = extractedData.basic_info.last_name;
  document.getElementById('title').value = extractedData.basic_info.title || '';
  document.getElementById('current_position').value = extractedData.basic_info.current_position || '';
  
  // Work experience
  populateWorkExperience(extractedData.work_experiences);
  
  // Education
  populateEducation(extractedData.educations);
  
  // Skills
  populateSkills(extractedData.skills);
  
  // Continue for other sections...
}
```

### 3. Data Review & Edit
- Candidates can review all extracted data
- Edit any incorrect or missing information
- Add additional details not found in the resume
- Validate data accuracy before submission

### 4. Later Profile Creation
- Use the reviewed and edited data
- Call a separate profile creation API
- Store the final data in the database

## File Requirements

### Supported Formats
- **File Type**: PDF only (`application/pdf`)
- **Max Size**: 10MB
- **Content**: Professional resumes in any language

### File Validation
- Type checking (PDF only)
- Size validation (10MB limit)
- Content processing (AI extraction)

## Error Handling

### Common Issues
1. **Invalid File Type**: Only PDF files accepted
2. **File Too Large**: Must be under 10MB
3. **AI Processing Failed**: Check Gemini API key and quota
4. **Invalid Token**: JWT authentication required
5. **Wrong Role**: Only candidates can access

### Troubleshooting
- Check file format and size
- Verify JWT token validity
- Ensure Gemini API key is configured
- Check server console for detailed logs

## Security Features

- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **File Validation**: Type and size restrictions
- **Input Sanitization**: AI response parsing
- **Error Handling**: Secure error messages

## Performance Considerations

- **File Processing**: PDF parsing and AI analysis
- **Response Time**: Depends on resume complexity
- **Memory Usage**: Optimized for large files
- **Concurrent Requests**: Single-threaded processing

## Testing

Use the provided test file:
```
test-cv-extraction-api.http
```

Test scenarios:
- ✅ Valid PDF upload
- ✅ Invalid file types
- ✅ Missing authentication
- ✅ Wrong user roles
- ✅ File size limits

## Next Steps

After successful data extraction:
1. **Review Data**: Check extracted information accuracy
2. **Edit Data**: Modify any incorrect or missing details
3. **Create Profile**: Use separate API to save final data
4. **Database Storage**: Store validated candidate information

## Notes

- This API is **read-only** - no database changes
- All data is returned for frontend processing
- Console logging provides detailed extraction insights
- Data structure matches your Prisma schema exactly
- Ready for form population and user review

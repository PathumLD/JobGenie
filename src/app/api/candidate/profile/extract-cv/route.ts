import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

// Types based on schema.prisma - following exact structure
interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  exp?: number;
  iat?: number;
}

interface ExtractedBasicInfo {
  first_name: string;
  last_name: string;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  bio: string | null;
  about: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  address: string | null;
  phone1: string | null;
  phone2: string | null;
  personal_website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  date_of_birth: string | null;
  nic: string | null;
  passport: string | null;
  remote_preference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible' | null;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  availability_status: 'available' | 'open_to_opportunities' | 'not_looking' | null;
  availability_date: string | null;
  professional_summary: string | null;
  total_years_experience: number | null;
  open_to_relocation: boolean | null;
  willing_to_travel: boolean | null;
  security_clearance: boolean | null;
  disability_status: string | null;
  veteran_status: string | null;
  pronouns: string | null;
  salary_visibility: 'confidential' | 'visible' | null;
  notice_period: number | null;
  work_authorization: string | null;
  visa_assistance_needed: boolean | null;
  work_availability: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | null;
  interview_ready: boolean | null;
  pre_qualified: boolean | null;
}

interface ExtractedWorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface ExtractedEducation {
  degree_diploma: string;
  university_school: string;
  field_of_study: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  grade: string | null;
  activities_societies: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface ExtractedCertificate {
  name: string;
  issuing_authority: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  skill_ids: string[];
  media_url: string | null;
}

interface ExtractedProject {
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  role: string | null;
  responsibilities: string[];
  technologies: string[];
  tools: string[];
  methodologies: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  url: string | null;
  repository_url: string | null;
  media_urls: string[];
  skills_gained: string[];
}

interface ExtractedAward {
  title: string;
  offered_by: string;
  associated_with: string | null;
  date: string;
  description: string | null;
  media_url: string | null;
  skill_ids: string[];
}

interface ExtractedVolunteering {
  role: string;
  institution: string;
  cause: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  media_url: string | null;
}

interface ExtractedSkill {
  name: string;
  category: string | null;
  description: string | null;
  proficiency: number | null; // 0-100
}

interface ExtractedLanguage {
  language: string;
  is_native: boolean;
  oral_proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
  written_proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic' | null;
}

interface ExtractedAccomplishment {
  title: string;
  description: string;
  work_experience_id: string | null;
  resume_id: string | null;
}

interface ExtractedData {
  basic_info: ExtractedBasicInfo;
  work_experiences: ExtractedWorkExperience[];
  educations: ExtractedEducation[];
  certificates: ExtractedCertificate[];
  projects: ExtractedProject[];
  skills: ExtractedSkill[];
  awards: ExtractedAward[];
  volunteering: ExtractedVolunteering[];
  languages: ExtractedLanguage[];
  accomplishments: ExtractedAccomplishment[];
}

const getCVExtractionPrompt = () => `
Extract candidate profile data from this CV and return STRICT JSON matching the EXACT structure:

{
  "basic_info": {
    "first_name": "string",
    "last_name": "string", 
    "title": "string|null",
    "current_position": "string|null",
    "industry": "string|null", 
    "bio": "string|null",
    "about": "string|null",
    "country": "string|null",
    "city": "string|null",
    "location": "string|null",
    "address": "string|null",
    "phone1": "string|null",
    "phone2": "string|null",
    "personal_website": "string|null",
    "github_url": "string|null",
    "linkedin_url": "string|null",
    "portfolio_url": "string|null",
    "years_of_experience": "number|null",
    "gender": "enum(male|female|other|prefer_not_to_say)|null",
    "date_of_birth": "YYYY-MM-DD|null",
    "nic": "string|null",
    "passport": "string|null",
    "remote_preference": "enum(remote_only|hybrid|onsite|flexible)|null",
    "experience_level": "enum(entry|junior|mid|senior|lead|principal)|null",
    "expected_salary_min": "number|null",
    "expected_salary_max": "number|null",
    "currency": "string|null",
    "availability_status": "enum(available|open_to_opportunities|not_looking)|null",
    "availability_date": "YYYY-MM-DD|null",
    "professional_summary": "string|null",
    "total_years_experience": "number|null",
    "open_to_relocation": "boolean|null",
    "willing_to_travel": "boolean|null",
    "security_clearance": "boolean|null",
    "disability_status": "string|null",
    "veteran_status": "string|null",
    "pronouns": "string|null",
    "salary_visibility": "enum(confidential|visible)|null",
    "notice_period": "number|null",
    "work_authorization": "string|null",
    "visa_assistance_needed": "boolean|null",
    "work_availability": "enum(full_time|part_time|contract|internship|freelance|volunteer)|null",
    "interview_ready": "boolean|null",
    "pre_qualified": "boolean|null"
  },
  "work_experiences": [
    {
      "title": "string",
      "company": "string", 
      "employment_type": "enum(full_time|part_time|contract|internship|freelance|volunteer)",
      "is_current": "boolean",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "location": "string|null",
      "description": "string|null",
      "skill_ids": "string[]",
      "media_url": "string|null"
    }
  ],
  "educations": [
    {
      "degree_diploma": "string",
      "university_school": "string",
      "field_of_study": "string|null", 
      "description": "string|null",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "grade": "string|null",
      "activities_societies": "string|null",
      "skill_ids": "string[]",
      "media_url": "string|null"
    }
  ],
  "certificates": [
    {
      "name": "string",
      "issuing_authority": "string",
      "issue_date": "YYYY-MM-DD|null",
      "expiry_date": "YYYY-MM-DD|null",
      "credential_id": "string|null",
      "credential_url": "string|null",
      "description": "string|null",
      "skill_ids": "string[]",
      "media_url": "string|null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD|null", 
      "end_date": "YYYY-MM-DD|null",
      "is_current": "boolean",
      "role": "string|null",
      "responsibilities": "string[]",
      "technologies": "string[]",
      "tools": "string[]",
      "methodologies": "string[]",
      "is_confidential": "boolean",
      "can_share_details": "boolean",
      "url": "string|null",
      "repository_url": "string|null",
      "media_urls": "string[]",
      "skills_gained": "string[]"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string|null",
      "description": "string|null",
      "proficiency": "number|null (0-100)"
    }
  ],
  "awards": [
    {
      "title": "string",
      "offered_by": "string",
      "associated_with": "string|null",
      "date": "YYYY-MM-DD",
      "description": "string|null",
      "media_url": "string|null",
      "skill_ids": "string[]"
    }
  ],
  "volunteering": [
    {
      "role": "string",
      "institution": "string",
      "cause": "string|null",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "is_current": "boolean",
      "description": "string|null",
      "media_url": "string|null"
    }
  ],
  "languages": [
    {
      "language": "string",
      "is_native": "boolean",
      "oral_proficiency": "enum(native|fluent|professional|conversational|basic)|null",
      "written_proficiency": "enum(native|fluent|professional|conversational|basic)|null"
    }
  ],
  "accomplishments": [
    {
      "title": "string",
      "description": "string",
      "work_experience_id": "string|null",
      "resume_id": "string|null"
    }
  ]
}

RULES:
1. STRICTLY follow the schema field names and types
2. Convert all dates to YYYY-MM-DD format
3. For enums, ONLY use specified values
4. For null fields, return null or omit
5. Return empty arrays for missing sections
6. NEVER include fields not in the schema
7. For skills, extract from job descriptions, projects, and dedicated skills sections
8. Return ONLY the JSON object with NO additional text
9. Extract accomplishments from work experience descriptions and achievement sections
10. Map volunteering organizations to "institution" field
11. For languages, infer proficiency based on context (native if mentioned as native, fluent if mentioned as fluent, etc.)
12. For experience levels, infer based on years of experience and job titles
13. For remote preference, infer from location mentions or remote work experience
14. For salary expectations, extract if mentioned in the CV
15. For availability, infer from current employment status
`;

// Helper function to calculate years of experience
function calculateYearsOfExperience(workExperiences: ExtractedWorkExperience[]): number {
  if (!workExperiences.length) return 0;
  
  let totalMonths = 0;
  const now = new Date();

  for (const exp of workExperiences) {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : now;
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 CV Data Extraction API called');

    // 1. Authenticate user - get token from Authorization header
    const accessToken = getTokenFromHeaders(request);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }



    let payload: JWTPayload;
    try {
      payload = verifyToken(accessToken) as JWTPayload;
      if (!payload) {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can extract CV data.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // 3. Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('📄 Processing CV:', file.name, 'Size:', file.size);

    try {
      // 4. Process CV with Gemini AI
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      const result = await model.generateContent([
        { text: getCVExtractionPrompt() },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 AI response received, length:', text.length);
      
      // Parse the JSON response
      let extractedData: ExtractedData;
      try {
        // Clean up any markdown formatting
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        extractedData = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully');
      } catch (error) {
        console.error('❌ Failed to parse AI response:', text);
        throw new Error('Invalid AI response format');
      }

      // 5. Calculate additional fields
      const calculatedYearsOfExperience = calculateYearsOfExperience(extractedData.work_experiences);
      
      // Update basic info with calculated values if not provided
      if (!extractedData.basic_info.years_of_experience) {
        extractedData.basic_info.years_of_experience = calculatedYearsOfExperience;
      }
      
      if (!extractedData.basic_info.total_years_experience) {
        extractedData.basic_info.total_years_experience = calculatedYearsOfExperience;
      }

      // 6. Console logging for extracted data
      console.log('\n🎯 EXTRACTED CV DATA SUMMARY:');
      console.log('=====================================');
      
      // Basic Info
      console.log('\n📋 BASIC INFORMATION:');
      console.log(`Name: ${extractedData.basic_info.first_name} ${extractedData.basic_info.last_name}`);
      console.log(`Title: ${extractedData.basic_info.title || 'Not specified'}`);
      console.log(`Current Position: ${extractedData.basic_info.current_position || 'Not specified'}`);
      console.log(`Industry: ${extractedData.basic_info.industry || 'Not specified'}`);
      console.log(`Location: ${extractedData.basic_info.location || 'Not specified'}`);
      console.log(`Years of Experience: ${extractedData.basic_info.years_of_experience || 0}`);
      console.log(`Phone: ${extractedData.basic_info.phone1 || 'Not specified'}`);
      console.log(`Email: ${payload.email}`);
      console.log(`Bio: ${extractedData.basic_info.bio || 'Not specified'}`);
      console.log(`About: ${extractedData.basic_info.about || 'Not specified'}`);
      
      // Work Experience
      console.log(`\n💼 WORK EXPERIENCE (${extractedData.work_experiences.length} positions):`);
      extractedData.work_experiences.forEach((exp, index) => {
        console.log(`  ${index + 1}. ${exp.title} at ${exp.company}`);
        console.log(`     Period: ${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || 'Not specified'}`);
        console.log(`     Type: ${exp.employment_type}, Location: ${exp.location || 'Not specified'}`);
        console.log(`     Description: ${exp.description ? exp.description.substring(0, 100) + '...' : 'Not specified'}`);
      });
      
      // Education
      console.log(`\n🎓 EDUCATION (${extractedData.educations.length} entries):`);
      extractedData.educations.forEach((edu, index) => {
        console.log(`  ${index + 1}. ${edu.degree_diploma} in ${edu.field_of_study || 'Not specified'}`);
        console.log(`     Institution: ${edu.university_school}`);
        console.log(`     Period: ${edu.start_date} - ${edu.end_date || 'Not specified'}`);
        console.log(`     Grade: ${edu.grade || 'Not specified'}`);
      });
      
      // Skills
      console.log(`\n🛠️ SKILLS (${extractedData.skills.length} skills):`);
      extractedData.skills.forEach((skill, index) => {
        console.log(`  ${index + 1}. ${skill.name}${skill.category ? ` (${skill.category})` : ''}${skill.proficiency ? ` - Proficiency: ${skill.proficiency}%` : ''}`);
      });
      
      // Projects
      console.log(`\n🚀 PROJECTS (${extractedData.projects.length} projects):`);
      extractedData.projects.forEach((proj, index) => {
        console.log(`  ${index + 1}. ${proj.name}`);
        console.log(`     Role: ${proj.role || 'Not specified'}`);
        console.log(`     Technologies: ${proj.technologies.join(', ') || 'Not specified'}`);
        console.log(`     Description: ${proj.description ? proj.description.substring(0, 100) + '...' : 'Not specified'}`);
      });
      
      // Certificates
      console.log(`\n🏆 CERTIFICATES (${extractedData.certificates.length} certificates):`);
      extractedData.certificates.forEach((cert, index) => {
        console.log(`  ${index + 1}. ${cert.name} from ${cert.issuing_authority}`);
        console.log(`     Issue Date: ${cert.issue_date || 'Not specified'}`);
        console.log(`     Expiry Date: ${cert.expiry_date || 'Not specified'}`);
      });
      
      // Awards
      console.log(`\n🏅 AWARDS (${extractedData.awards.length} awards):`);
      extractedData.awards.forEach((award, index) => {
        console.log(`  ${index + 1}. ${award.title} from ${award.offered_by}`);
        console.log(`     Date: ${award.date}, Associated: ${award.associated_with || 'Not specified'}`);
      });
      
      // Volunteering
      console.log(`\n🤝 VOLUNTEERING (${extractedData.volunteering.length} positions):`);
      extractedData.volunteering.forEach((vol, index) => {
        console.log(`  ${index + 1}. ${vol.role} at ${vol.institution}`);
        console.log(`     Cause: ${vol.cause || 'Not specified'}`);
        console.log(`     Period: ${vol.start_date} - ${vol.is_current ? 'Present' : vol.end_date || 'Not specified'}`);
      });
      
      // Languages
      console.log(`\n🌍 LANGUAGES (${extractedData.languages.length} languages):`);
      extractedData.languages.forEach((lang, index) => {
        console.log(`  ${index + 1}. ${lang.language}${lang.is_native ? ' (Native)' : ''}`);
        console.log(`     Oral: ${lang.oral_proficiency || 'Not specified'}, Written: ${lang.written_proficiency || 'Not specified'}`);
      });
      
      // Accomplishments
      console.log(`\n✨ ACCOMPLISHMENTS (${extractedData.accomplishments.length} achievements):`);
      extractedData.accomplishments.forEach((acc, index) => {
        console.log(`  ${index + 1}. ${acc.title}`);
        console.log(`     Description: ${acc.description ? acc.description.substring(0, 100) + '...' : 'Not specified'}`);
      });
      
      console.log('\n=====================================');
      console.log('📊 EXTRACTION COMPLETE - Data ready for form population');
      console.log('=====================================\n');

      // 7. Convert file to base64 for storage
      const resumeArrayBuffer = await file.arrayBuffer();
      const resumeBase64Data = Buffer.from(resumeArrayBuffer).toString('base64');
      const resumeFileData = `data:${file.type};base64,${resumeBase64Data}`;

      // 8. Return extracted data for frontend form population
      return NextResponse.json({
        success: true,
        message: 'CV data extracted successfully',
        data: {
          extracted_data: extractedData,
          file_info: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          resumeFile: resumeFileData, // Store resume file as base64
          extraction_summary: {
            work_experiences_count: extractedData.work_experiences.length,
            educations_count: extractedData.educations.length,
            skills_count: extractedData.skills.length,
            projects_count: extractedData.projects.length,
            certificates_count: extractedData.certificates.length,
            awards_count: extractedData.awards.length,
            volunteering_count: extractedData.volunteering.length,
            languages_count: extractedData.languages.length,
            accomplishments_count: extractedData.accomplishments.length,
          }
        }
      });

    } catch (processingError) {
      console.error('❌ CV processing error:', processingError);
      return NextResponse.json(
        { 
          error: 'Failed to process CV',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('CV extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract CV data' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

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

// Type definitions for extracted data
interface ExtractedBasicInfo {
  first_name?: string;
  last_name?: string;
  title?: string;
  current_position?: string;
  industry?: string;
  bio?: string;
  about?: string;
  country?: string;
  city?: string;
  location?: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  personal_website?: string;
  github_url?: string;
  linkedin_url?: string;
  years_of_experience?: number;
  gender?: string;
  date_of_birth?: string;
  nic?: string;
  passport?: string;
  remote_preference?: string;
  experience_level?: string;
  expected_salary_min?: number;
  expected_salary_max?: number;
  currency?: string;
  availability_status?: string;
  availability_date?: string;
  professional_summary?: string;
  total_years_experience?: number;
  open_to_relocation?: boolean;
  willing_to_travel?: boolean;
  security_clearance?: boolean;
  disability_status?: string;
  veteran_status?: string;
  pronouns?: string;
  salary_visibility?: string;
  notice_period?: number;
  work_authorization?: string;
  visa_assistance_needed?: boolean;
  work_availability?: string;
  interview_ready?: boolean;
  pre_qualified?: boolean;
}

interface ExtractedWorkExperience {
  title: string;
  company: string;
  employment_type: string;
  is_current: boolean;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedEducation {
  degree_diploma: string;
  university_school: string;
  field_of_study?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  activities_societies?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedCertificate {
  name: string;
  issuing_authority: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface ExtractedProject {
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  role?: string;
  responsibilities?: string[];
  technologies?: string[];
  tools?: string[];
  methodologies?: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  url?: string;
  repository_url?: string;
  media_urls?: string[];
  skills_gained?: string[];
}

interface ExtractedSkill {
  name: string;
  category?: string;
  description?: string;
  proficiency?: number;
}

interface ExtractedAward {
  title: string;
  offered_by: string;
  associated_with?: string;
  date: string;
  description?: string;
  media_url?: string;
  skill_ids?: string[];
}

interface ExtractedVolunteering {
  role: string;
  institution: string;
  cause?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  media_url?: string;
}

interface ExtractedLanguage {
  language: string;
  is_native: boolean;
  oral_proficiency?: string;
  written_proficiency?: string;
}

interface ExtractedAccomplishment {
  title: string;
  description: string;
  work_experience_id?: string;
  resume_id?: string;
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

// Enhanced duplicate detection functions (unused but kept for future reference)
// async function isWorkExperienceDuplicate(
//   candidateId: string, 
//   workExp: ExtractedWorkExperience
// ): Promise<boolean> {
//   const existing = await prisma.workExperience.findFirst({
//     where: {
//       candidate_id: candidateId,
//       title: { equals: workExp.title, mode: 'insensitive' },
//       company: { equals: workExp.company, mode: 'insensitive' },
//       employment_type: workExp.employment_type as any,
//     }
//   });
//   return !!existing;
// }

// async function isEducationDuplicate(
//   candidateId: string, 
//   education: ExtractedEducation
// ): Promise<boolean> {
//   const existing = await prisma.education.findFirst({
//     where: {
//       candidate_id: candidateId,
//       degree_diploma: { equals: education.degree_diploma, mode: 'insensitive' },
//       university_school: { equals: education.university_school, mode: 'insensitive' },
//     }
//   });
//   return !!existing;
// }

async function isCertificateDuplicate(
  candidateId: string, 
  certificate: ExtractedCertificate
): Promise<boolean> {
  const existing = await prisma.certificate.findFirst({
    where: {
      candidate_id: candidateId,
      name: { equals: certificate.name, mode: 'insensitive' },
      issuing_authority: { equals: certificate.issuing_authority, mode: 'insensitive' },
    }
  });
  return !!existing;
}

async function isProjectDuplicate(
  candidateId: string, 
  project: ExtractedProject
): Promise<boolean> {
  const existing = await prisma.project.findFirst({
    where: {
      candidate_id: candidateId,
      name: { equals: project.name, mode: 'insensitive' },
    }
  });
  return !!existing;
}

async function isAwardDuplicate(
  candidateId: string, 
  award: ExtractedAward
): Promise<boolean> {
  const existing = await prisma.award.findFirst({
    where: {
      candidate_id: candidateId,
      title: { equals: award.title, mode: 'insensitive' },
      offered_by: { equals: award.offered_by, mode: 'insensitive' },
    }
  });
  return !!existing;
}

async function isVolunteeringDuplicate(
  candidateId: string, 
  volunteering: ExtractedVolunteering
): Promise<boolean> {
  const existing = await prisma.volunteering.findFirst({
    where: {
      candidate_id: candidateId,
      role: { equals: volunteering.role, mode: 'insensitive' },
      institution: { equals: volunteering.institution, mode: 'insensitive' },
    }
  });
  return !!existing;
}

async function isLanguageDuplicate(
  candidateId: string, 
  language: ExtractedLanguage
): Promise<boolean> {
  const existing = await prisma.language.findFirst({
    where: {
      candidate_id: candidateId,
      language: { equals: language.language, mode: 'insensitive' },
    }
  });
  return !!existing;
}

// async function isSkillDuplicate(
//   candidateId: string, 
//   skill: ExtractedSkill
// ): Promise<boolean> {
//   const existing = await prisma.candidateSkill.findFirst({
//     where: {
//       candidate_id: candidateId,
//       skill: {
//         name: { equals: skill.name, mode: 'insensitive' }
//       }
//     },
//     include: {
//       skill: true
//     }
//   });
//   return !!existing;
// }

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
  let totalMonths = 0;
  
  for (const exp of workExperiences) {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
    
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, monthDiff);
  }

  return Math.round(totalMonths / 12);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 CV Data Extraction and Merge API called');

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

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('📄 Processing CV:', file.name, 'Size:', file.size);

    // 4. Check if candidate profile exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId }
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found. Please create your profile first.' },
        { status: 404 }
      );
    }

    try {
      // 5. Process CV with Gemini AI
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
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        extractedData = JSON.parse(cleanedText);
        console.log('✅ JSON parsed successfully');
      } catch (_error) {
        console.error('❌ Failed to parse AI response:', text);
        throw new Error('Invalid AI response format');
      }

      // 6. Calculate additional fields
      const calculatedYearsOfExperience = calculateYearsOfExperience(extractedData.work_experiences);
      
      if (!extractedData.basic_info.years_of_experience) {
        extractedData.basic_info.years_of_experience = calculatedYearsOfExperience;
      }
      
      if (!extractedData.basic_info.total_years_experience) {
        extractedData.basic_info.total_years_experience = calculatedYearsOfExperience;
      }

      // 7. Merge data with existing profile (prevent duplicates)
      // Increase transaction timeout to 30 seconds for complex CV processing
      console.log('🔄 Starting CV data merge process...');
      console.log('📊 Data to process:', {
        work_experiences: extractedData.work_experiences.length,
        educations: extractedData.educations.length,
        skills: extractedData.skills.length,
        projects: extractedData.projects.length,
        certificates: extractedData.certificates.length,
        awards: extractedData.awards.length,
        volunteering: extractedData.volunteering.length,
        languages: extractedData.languages.length,
        accomplishments: extractedData.accomplishments.length
      });
      
      const mergeResults = await prisma.$transaction(async (tx) => {
        const results = {
          basic_info_updated: false,
          new_work_experiences: 0,
          new_educations: 0,
          new_certificates: 0,
          new_projects: 0,
          new_skills: 0,
          new_awards: 0,
          new_volunteering: 0,
          new_languages: 0,
          new_accomplishments: 0,
          skipped_duplicates: {
            work_experiences: 0,
            educations: 0,
            certificates: 0,
            projects: 0,
            skills: 0,
            awards: 0,
            volunteering: 0,
            languages: 0,
            accomplishments: 0
          }
        };

        // Update basic info (only if new data exists and current data is null/empty)
        const basicInfoUpdates: Record<string, unknown> = {};
        let hasBasicInfoUpdates = false;

        for (const [key, value] of Object.entries(extractedData.basic_info)) {
          if (value !== null && value !== undefined && value !== '') {
            const currentValue = (existingCandidate as Record<string, unknown>)[key];
            if (!currentValue || currentValue === '' || currentValue === null) {
              basicInfoUpdates[key] = value;
              hasBasicInfoUpdates = true;
            }
          }
        }

        if (hasBasicInfoUpdates) {
          await tx.candidate.update({
            where: { user_id: payload.userId },
            data: {
              ...basicInfoUpdates,
              updated_at: new Date(),
            }
          });
          results.basic_info_updated = true;
          console.log('✅ Basic info updated with new data');
        }

        // Process work experiences (batch check for better performance)
        if (extractedData.work_experiences.length > 0) {
          // Get all existing work experiences for this candidate at once
          const existingWorkExps = await tx.workExperience.findMany({
            where: { candidate_id: payload.userId },
            select: { title: true, company: true, employment_type: true, start_date: true, end_date: true, description: true }
          });

          // Create multiple keys for each existing experience to catch variations
          const existingWorkExpKeys = new Set();
          existingWorkExps.forEach(exp => {
            const title = exp.title?.toLowerCase().trim() || '';
            const company = exp.company?.toLowerCase().trim() || '';
            const employmentType = exp.employment_type || '';
            
            // Primary key: title + company + employment type
            existingWorkExpKeys.add(`${title}|${company}|${employmentType}`);
            
            // Secondary key: title + company (without employment type)
            existingWorkExpKeys.add(`${title}|${company}`);
            
            // Tertiary key: just company + employment type
            existingWorkExpKeys.add(`${company}|${employmentType}`);
          });

          for (const workExp of extractedData.work_experiences) {
            // Skip if essential fields are missing
            if (!workExp.title?.trim() || !workExp.company?.trim()) {
              console.log('ℹ️ Skipping work experience with missing title or company:', workExp);
              continue;
            }
            
            const title = workExp.title.toLowerCase().trim();
            const company = workExp.company.toLowerCase().trim();
            const employmentType = workExp.employment_type || '';
            
            // Check multiple keys for duplicates
            const primaryKey = `${title}|${company}|${employmentType}`;
            const secondaryKey = `${title}|${company}`;
            const tertiaryKey = `${company}|${employmentType}`;
            
            if (existingWorkExpKeys.has(primaryKey) || 
                existingWorkExpKeys.has(secondaryKey) || 
                existingWorkExpKeys.has(tertiaryKey)) {
              results.skipped_duplicates.work_experiences++;
              console.log('ℹ️ Work experience already exists, skipping:', workExp.title, 'at', workExp.company);
              continue;
            }

            await tx.workExperience.create({
              data: {
                candidate_id: payload.userId,
                title: workExp.title,
                company: workExp.company,
                employment_type: workExp.employment_type as 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer',
                is_current: workExp.is_current,
                start_date: new Date(workExp.start_date),
                end_date: workExp.end_date ? new Date(workExp.end_date) : null,
                location: workExp.location,
                description: workExp.description,
                skill_ids: workExp.skill_ids || [],
                media_url: workExp.media_url,
                created_at: new Date(),
                updated_at: new Date(),
              }
            });
            results.new_work_experiences++;
          }
        }

        // Process educations (batch check for better performance)
        if (extractedData.educations.length > 0) {
          const existingEducations = await tx.education.findMany({
            where: { candidate_id: payload.userId },
            select: { degree_diploma: true, university_school: true, field_of_study: true, start_date: true, end_date: true }
          });

          // Create multiple keys for each existing education to catch variations
          const existingEducationKeys = new Set();
          existingEducations.forEach(edu => {
            const degree = edu.degree_diploma?.toLowerCase().trim() || '';
            const university = edu.university_school?.toLowerCase().trim() || '';
            const field = edu.field_of_study?.toLowerCase().trim() || '';
            
            // Primary key: degree + university
            existingEducationKeys.add(`${degree}|${university}`);
            
            // Secondary key: just university (to catch same university with different degrees)
            existingEducationKeys.add(university);
            
            // Tertiary key: degree + field (to catch same degree in different universities)
            if (field) {
              existingEducationKeys.add(`${degree}|${field}`);
            }
          });

          for (const education of extractedData.educations) {
            // Skip if essential fields are missing
            if (!education.degree_diploma?.trim() || !education.university_school?.trim()) {
              console.log('ℹ️ Skipping education with missing degree or university:', education);
              continue;
            }
            
            const degree = education.degree_diploma.toLowerCase().trim();
            const university = education.university_school.toLowerCase().trim();
            const field = education.field_of_study?.toLowerCase().trim() || '';
            
            // Check multiple keys for duplicates
            const primaryKey = `${degree}|${university}`;
            const secondaryKey = university;
            const tertiaryKey = field ? `${degree}|${field}` : '';
            
            if (existingEducationKeys.has(primaryKey) || 
                existingEducationKeys.has(secondaryKey) || 
                (tertiaryKey && existingEducationKeys.has(tertiaryKey))) {
              results.skipped_duplicates.educations++;
              console.log('ℹ️ Education already exists, skipping:', education.degree_diploma, 'at', education.university_school);
              continue;
            }

            await tx.education.create({
              data: {
                candidate_id: payload.userId,
                degree_diploma: education.degree_diploma,
                university_school: education.university_school,
                field_of_study: education.field_of_study,
                description: education.description,
                start_date: new Date(education.start_date),
                end_date: education.end_date ? new Date(education.end_date) : null,
                grade: education.grade,
                activities_societies: education.activities_societies,
                skill_ids: education.skill_ids || [],
                media_url: education.media_url,
                created_at: new Date(),
                updated_at: new Date(),
              }
            });
            results.new_educations++;
          }
        }

        // Process certificates (batch check for better performance)
        if (extractedData.certificates.length > 0) {
          // Get all existing certificates for this candidate at once
          const existingCertificates = await tx.certificate.findMany({
            where: { candidate_id: payload.userId },
            select: { name: true, issuing_authority: true, issue_date: true, credential_id: true }
          });

          // Create multiple keys for each existing certificate to catch variations
          const existingCertificateKeys = new Set();
          existingCertificates.forEach(cert => {
            const name = cert.name?.toLowerCase().trim() || '';
            const authority = cert.issuing_authority?.toLowerCase().trim() || '';
            const credentialId = cert.credential_id?.toLowerCase().trim() || '';
            
            // Primary key: name + authority
            existingCertificateKeys.add(`${name}|${authority}`);
            
            // Secondary key: just name (to catch same certificate from different sources)
            existingCertificateKeys.add(name);
            
            // Tertiary key: credential ID if available
            if (credentialId) {
              existingCertificateKeys.add(credentialId);
            }
          });

          for (const certificate of extractedData.certificates) {
            // Skip if essential fields are missing
            if (!certificate.name?.trim() || !certificate.issuing_authority?.trim()) {
              console.log('ℹ️ Skipping certificate with missing name or authority:', certificate);
              continue;
            }
            
            const name = certificate.name.toLowerCase().trim();
            const authority = certificate.issuing_authority.toLowerCase().trim();
            const credentialId = certificate.credential_id?.toLowerCase().trim() || '';
            
            // Check multiple keys for duplicates
            const primaryKey = `${name}|${authority}`;
            const secondaryKey = name;
            const tertiaryKey = credentialId;
            
            if (existingCertificateKeys.has(primaryKey) || 
                existingCertificateKeys.has(secondaryKey) ||
                (tertiaryKey && existingCertificateKeys.has(tertiaryKey))) {
              results.skipped_duplicates.certificates++;
              console.log('ℹ️ Certificate already exists, skipping:', certificate.name, 'from', certificate.issuing_authority);
              continue;
            }

          await tx.certificate.create({
            data: {
              candidate_id: payload.userId,
              name: certificate.name,
              issuing_authority: certificate.issuing_authority,
              issue_date: certificate.issue_date ? new Date(certificate.issue_date) : null,
              expiry_date: certificate.expiry_date ? new Date(certificate.expiry_date) : null,
              credential_id: certificate.credential_id,
              credential_url: certificate.credential_url,
              description: certificate.description,
              skill_ids: certificate.skill_ids || [],
              media_url: certificate.media_url,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          results.new_certificates++;
          }
        }

        // Process projects (batch check for better performance)
        if (extractedData.projects.length > 0) {
          // Get all existing projects for this candidate at once
          const existingProjects = await tx.project.findMany({
            where: { candidate_id: payload.userId },
            select: { name: true, role: true, technologies: true, description: true }
          });

          // Create multiple keys for each existing project to catch variations
          const existingProjectKeys = new Set();
          existingProjects.forEach(proj => {
            const name = proj.name?.toLowerCase().trim() || '';
            const role = proj.role?.toLowerCase().trim() || '';
            const technologies = proj.technologies?.map(t => t.toLowerCase().trim()).join('|') || '';
            
            // Primary key: project name
            existingProjectKeys.add(name);
            
            // Secondary key: name + role
            if (role) {
              existingProjectKeys.add(`${name}|${role}`);
            }
            
            // Tertiary key: name + first technology
            if (technologies) {
              const firstTech = technologies.split('|')[0];
              existingProjectKeys.add(`${name}|${firstTech}`);
            }
          });

          for (const project of extractedData.projects) {
            // Skip if essential fields are missing
            if (!project.name?.trim()) {
              console.log('ℹ️ Skipping project with missing name:', project);
              continue;
            }
            
            const name = project.name.toLowerCase().trim();
            const role = project.role?.toLowerCase().trim() || '';
            const technologies = project.technologies?.map(t => t.toLowerCase().trim()).join('|') || '';
            
            // Check multiple keys for duplicates
            const primaryKey = name;
            const secondaryKey = role ? `${name}|${role}` : '';
            const tertiaryKey = technologies ? `${name}|${technologies.split('|')[0]}` : '';
            
            if (existingProjectKeys.has(primaryKey) || 
                (secondaryKey && existingProjectKeys.has(secondaryKey)) ||
                (tertiaryKey && existingProjectKeys.has(tertiaryKey))) {
              results.skipped_duplicates.projects++;
              console.log('ℹ️ Project already exists, skipping:', project.name);
              continue;
            }

            await tx.project.create({
              data: {
                candidate_id: payload.userId,
                name: project.name,
                description: project.description,
                start_date: project.start_date ? new Date(project.start_date) : null,
                end_date: project.end_date ? new Date(project.end_date) : null,
                is_current: project.is_current,
                role: project.role,
                responsibilities: project.responsibilities || [],
                technologies: project.technologies || [],
                tools: project.tools || [],
                methodologies: project.methodologies || [],
                is_confidential: project.is_confidential,
                can_share_details: project.can_share_details,
                url: project.url,
                repository_url: project.repository_url,
                media_urls: project.media_urls || [],
                skills_gained: project.skills_gained || [],
                created_at: new Date(),
                updated_at: new Date(),
              }
            });
            results.new_projects++;
          }
        }

        // Process skills (batch processing for better performance)
        if (extractedData.skills.length > 0) {
          console.log(`🔄 Processing ${extractedData.skills.length} skills...`);
          
          // Get existing candidate skills
          const existingCandidateSkills = await tx.candidateSkill.findMany({
            where: { candidate_id: payload.userId },
            include: { skill: true }
          });

          // Create multiple keys for each existing skill to catch variations
          const existingSkillNames = new Set();
          existingCandidateSkills.forEach(cs => {
            const skillName = cs.skill.name.toLowerCase().trim();
            existingSkillNames.add(skillName);
            
            // Also add common variations and abbreviations
            if (skillName.includes('javascript')) {
              existingSkillNames.add('js');
            }
            if (skillName.includes('typescript')) {
              existingSkillNames.add('ts');
            }
            if (skillName.includes('react')) {
              existingSkillNames.add('reactjs');
            }
            if (skillName.includes('node')) {
              existingSkillNames.add('nodejs');
            }
            if (skillName.includes('express')) {
              existingSkillNames.add('expressjs');
            }
            if (skillName.includes('mongodb')) {
              existingSkillNames.add('mongo');
            }
            if (skillName.includes('postgresql')) {
              existingSkillNames.add('postgres');
            }
            if (skillName.includes('sql server')) {
              existingSkillNames.add('mssql');
            }
          });

          // Get all skills that might exist
          const skillNames = extractedData.skills.map((s: ExtractedSkill) => s.name);
          const existingSkills = await tx.skill.findMany({
            where: { 
              name: { in: skillNames, mode: 'insensitive' }
            }
          });

          const skillMap = new Map(
            existingSkills.map(skill => [skill.name.toLowerCase().trim(), skill])
          );

          // Prepare batch operations for better performance
          const skillsToCreate: Array<{ name: string; category: string | null; description: string | null }> = [];
          const candidateSkillsToCreate: Array<{ candidate_id: string; skill_id: string; skill_source: string; proficiency: number; years_of_experience: number; source_title: string; source_type: string }> = [];
          
          for (const skillData of extractedData.skills) {
            const skillNameLower = skillData.name.toLowerCase().trim();
            
            // Skip if skill name is empty or too short
            if (!skillNameLower || skillNameLower.length < 2) {
              console.log('ℹ️ Skipping invalid skill name:', skillData.name);
              continue;
            }
            
            // Check for exact matches and variations
            if (existingSkillNames.has(skillNameLower)) {
              results.skipped_duplicates.skills++;
              console.log('ℹ️ Skill already exists, skipping:', skillData.name);
              continue;
            }
            
            // Check for common variations
            const variations = [
              skillNameLower.replace('javascript', 'js'),
              skillNameLower.replace('typescript', 'ts'),
              skillNameLower.replace('reactjs', 'react'),
              skillNameLower.replace('nodejs', 'node'),
              skillNameLower.replace('expressjs', 'express'),
              skillNameLower.replace('mongodb', 'mongo'),
              skillNameLower.replace('postgresql', 'postgres'),
              skillNameLower.replace('sql server', 'mssql')
            ];
            
            if (variations.some(variation => existingSkillNames.has(variation))) {
              results.skipped_duplicates.skills++;
              console.log('ℹ️ Skill variation already exists, skipping:', skillData.name);
              continue;
            }

            // Find or create the skill
            let skill = skillMap.get(skillNameLower);
            if (!skill) {
              // Add to batch creation
              skillsToCreate.push({
                name: skillData.name.trim(),
                category: skillData.category?.trim() || null,
                description: skillData.description?.trim() || null,
              });
            }
          }

          // Batch create skills if any
          if (skillsToCreate.length > 0) {
            console.log(`📝 Creating ${skillsToCreate.length} new skills...`);
            const createdSkills = await tx.skill.createMany({
              data: skillsToCreate.map(skill => ({
                ...skill,
                is_active: true,
              })),
              skipDuplicates: true,
            });
            console.log(`✅ Created ${createdSkills.count} new skills`);
            
            // Refresh skill map with newly created skills
            if (createdSkills.count > 0) {
              const newSkills = await tx.skill.findMany({
                where: { 
                  name: { in: skillsToCreate.map(s => s.name), mode: 'insensitive' }
                }
              });
              newSkills.forEach(skill => {
                skillMap.set(skill.name.toLowerCase().trim(), skill);
              });
            }
          }

          // Now create candidate skills for all valid skills
          for (const skillData of extractedData.skills) {
            const skillNameLower = skillData.name.toLowerCase().trim();
            
            // Skip if skill name is empty or too short
            if (!skillNameLower || skillNameLower.length < 2) {
              continue;
            }
            
            // Skip if already exists
            if (existingSkillNames.has(skillNameLower)) {
              continue;
            }
            
            // Skip if variation exists
            const variations = [
              skillNameLower.replace('javascript', 'js'),
              skillNameLower.replace('typescript', 'ts'),
              skillNameLower.replace('reactjs', 'react'),
              skillNameLower.replace('nodejs', 'node'),
              skillNameLower.replace('expressjs', 'express'),
              skillNameLower.replace('mongodb', 'mongo'),
              skillNameLower.replace('postgresql', 'postgres'),
              skillNameLower.replace('sql server', 'mssql')
            ];
            
            if (variations.some(variation => existingSkillNames.has(variation))) {
              continue;
            }

            // Get the skill (should exist now)
            const skill = skillMap.get(skillNameLower);
            if (skill) {
              candidateSkillsToCreate.push({
                candidate_id: payload.userId,
                skill_id: skill.id,
                skill_source: 'cv_extraction',
                proficiency: skillData.proficiency || 50,
                years_of_experience: 0,
                source_title: 'CV Extraction',
                source_type: 'cv_extraction',
              });
            }
          }

          // Batch create candidate skills
          if (candidateSkillsToCreate.length > 0) {
            console.log(`🔗 Creating ${candidateSkillsToCreate.length} candidate skill relationships...`);
            const createdCandidateSkills = await tx.candidateSkill.createMany({
              data: candidateSkillsToCreate,
              skipDuplicates: true,
            });
            console.log(`✅ Created ${createdCandidateSkills.count} candidate skill relationships`);
            results.new_skills = createdCandidateSkills.count;
          }
        }

        // Process awards
        for (const award of extractedData.awards) {
          const isDuplicate = await isAwardDuplicate(payload.userId, award);
          if (isDuplicate) {
            results.skipped_duplicates.awards++;
            console.log('ℹ️ Award already exists, skipping:', award.title, 'from', award.offered_by);
            continue;
          }

          await tx.award.create({
            data: {
              candidate_id: payload.userId,
              title: award.title,
              offered_by: award.offered_by,
              associated_with: award.associated_with,
              date: new Date(award.date),
              description: award.description,
              media_url: award.media_url,
              skill_ids: award.skill_ids || [],
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          results.new_awards++;
        }

        // Process volunteering
        for (const volunteering of extractedData.volunteering) {
          const isDuplicate = await isVolunteeringDuplicate(payload.userId, volunteering);
          if (isDuplicate) {
            results.skipped_duplicates.volunteering++;
            console.log('ℹ️ Volunteering already exists, skipping:', volunteering.role, 'at', volunteering.institution);
            continue;
          }

          await tx.volunteering.create({
            data: {
              candidate_id: payload.userId,
              role: volunteering.role,
              institution: volunteering.institution,
              cause: volunteering.cause,
              start_date: new Date(volunteering.start_date),
              end_date: volunteering.end_date ? new Date(volunteering.end_date) : null,
              is_current: volunteering.is_current,
              description: volunteering.description,
              media_url: volunteering.media_url,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          results.new_volunteering++;
        }

        // Process languages
        for (const language of extractedData.languages) {
          const isDuplicate = await isLanguageDuplicate(payload.userId, language);
          if (isDuplicate) {
            results.skipped_duplicates.languages++;
            console.log('ℹ️ Language already exists, skipping:', language.language);
            continue;
          }

          // Validate and cast proficiency levels
          const validProficiencies = ['basic', 'conversational', 'professional', 'fluent', 'native'] as const;
          const oralProficiency = language.oral_proficiency && validProficiencies.includes(language.oral_proficiency as any) 
            ? (language.oral_proficiency as 'basic' | 'conversational' | 'professional' | 'fluent' | 'native')
            : null;
          const writtenProficiency = language.written_proficiency && validProficiencies.includes(language.written_proficiency as any)
            ? (language.written_proficiency as 'basic' | 'conversational' | 'professional' | 'fluent' | 'native')
            : null;

          await tx.language.create({
            data: {
              candidate_id: payload.userId,
              language: language.language,
              is_native: language.is_native,
              oral_proficiency: oralProficiency,
              written_proficiency: writtenProficiency,
              created_at: new Date(),
              updated_at: new Date(),
            }
          });
          results.new_languages++;
        }

        // Process accomplishments (batch check for better performance)
        if (extractedData.accomplishments.length > 0) {
          // Get existing accomplishments for this candidate
          const existingAccomplishments = await tx.accomplishment.findMany({
            where: { candidate_id: payload.userId },
            select: { title: true, description: true }
          });

          const existingAccomplishmentKeys = new Set(
            existingAccomplishments.map(acc => 
              `${acc.title?.toLowerCase() || ''}|${acc.description?.toLowerCase() || ''}`
            )
          );

          for (const accomplishment of extractedData.accomplishments) {
            // Skip if essential fields are missing
            if (!accomplishment.title?.trim()) {
              console.log('ℹ️ Skipping accomplishment with missing title:', accomplishment);
              continue;
            }
            
            const accomplishmentKey = `${accomplishment.title.toLowerCase().trim()}|${accomplishment.description?.toLowerCase().trim() || ''}`;
            
            if (existingAccomplishmentKeys.has(accomplishmentKey)) {
              results.skipped_duplicates.accomplishments++;
              console.log('ℹ️ Accomplishment already exists, skipping:', accomplishment.title);
              continue;
            }

            await tx.accomplishment.create({
              data: {
                candidate_id: payload.userId,
                title: accomplishment.title,
                description: accomplishment.description,
                work_experience_id: accomplishment.work_experience_id,
                resume_id: accomplishment.resume_id,
                created_at: new Date(),
                updated_at: new Date(),
              }
            });
            results.new_accomplishments++;
          }
        }

        return results;
      }, {
        maxWait: 120000, // 2 minutes
        timeout: 120000, // 2 minutes
      });

      console.log('✅ CV data merged successfully');
      console.log('📊 Merge results:', mergeResults);
      console.log('📊 Duplicates skipped:', mergeResults.skipped_duplicates);
      console.log('📊 New items added:', {
        work_experiences: mergeResults.new_work_experiences,
        educations: mergeResults.new_educations,
        skills: mergeResults.new_skills,
        projects: mergeResults.new_projects,
        certificates: mergeResults.new_certificates,
        awards: mergeResults.new_awards,
        volunteering: mergeResults.new_volunteering,
        languages: mergeResults.new_languages,
        accomplishments: mergeResults.new_accomplishments
      });

      // 7. Upload CV file to Supabase storage and save as resume
      let resumeRecord = null;
      let uploadResult = null;
      
      try {
        console.log('📤 Uploading CV file to storage as resume...');
        
        // Import ResumeStorage for file upload
        const { ResumeStorage } = await import('@/lib/resume-storage');
        
        // Upload file to storage
        uploadResult = await ResumeStorage.uploadCVFile(file, payload.userId);
        console.log('✅ CV file uploaded successfully:', uploadResult.publicUrl);
        
        // Create resume record in database
        resumeRecord = await prisma.resume.create({
          data: {
            candidate_id: payload.userId,
            is_allow_fetch: true,
            resume_url: uploadResult.publicUrl,
            original_filename: file.name,
            file_size: file.size,
            file_type: file.type,
            is_primary: false, // Don't override existing primary resume
            uploaded_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
        
        console.log('✅ Resume record created:', resumeRecord.id);
        
      } catch (uploadError) {
        console.error('❌ Resume upload failed:', uploadError);
        // Continue with merge even if resume upload fails
        // The extracted data is still valuable
      }

      return NextResponse.json({
        success: true,
        message: 'CV data extracted and merged successfully',
        data: {
          file_info: {
            name: file.name,
            size: file.size,
            type: file.type
          },
          merge_results: mergeResults,
          resume_record: resumeRecord, // Include resume record if created
          upload_result: uploadResult, // Include upload result if successful
          extracted_summary: {
            work_experiences_count: extractedData.work_experiences.length,
            educations_count: extractedData.educations.length,
            skills_count: extractedData.skills.length,
            projects_count: extractedData.projects.length,
            certificates_count: extractedData.certificates.length,
            awards_count: extractedData.awards.length,
            volunteering_count: extractedData.volunteering.length,
            languages_count: extractedData.languages.length,
            accomplishments_count: extractedData.accomplishments.length
          },
          extracted_data: extractedData
        }
      });

    } catch (error) {
      console.error('❌ CV processing error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process CV',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ CV extraction and merge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

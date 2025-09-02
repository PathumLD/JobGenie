import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { getTokenFromHeaders } from '@/lib/jwt';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types based on schema.prisma - following exact structure
interface JWTPayload {
  userId: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  membership_no?: string;
  role: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
  userType: 'candidate' | 'employer' | 'mis' | 'recruitment_agency';
}

interface UpdateBasicInfo {
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string; // YYYY-MM-DD
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
  nic?: string;
  passport?: string;
  remote_preference?: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  years_of_experience?: number;
  expected_salary_min?: number;
  expected_salary_max?: number;
  currency?: string;
  availability_status?: 'available' | 'open_to_opportunities' | 'not_looking';
  availability_date?: string; // YYYY-MM-DD
  github_url?: string;
  linkedin_url?: string;
  resume_url?: string;
  professional_summary?: string;
  total_years_experience?: number;
  open_to_relocation?: boolean;
  willing_to_travel?: boolean;
  security_clearance?: boolean;
  disability_status?: string;
  veteran_status?: string;
  pronouns?: string;
  salary_visibility?: 'confidential' | 'range_only' | 'exact' | 'negotiable';
  notice_period?: number;
  work_authorization?: 'citizen' | 'permanent_resident' | 'work_visa' | 'requires_sponsorship' | 'other';
  visa_assistance_needed?: boolean;
  work_availability?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'volunteer';
  interview_ready?: boolean;
  pre_qualified?: boolean;
  profile_completion_percentage?: number;
  completedProfile?: boolean;
}

interface UpdateWorkExperience {
  id?: string; // For existing records - must be valid UUID
  title?: string;
  company?: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current?: boolean;
  start_date?: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  location?: string;
  description?: string;
  skill_ids?: string[]; // Array of valid UUIDs
  media_url?: string;
}

interface UpdateEducation {
  id?: string; // For existing records - must be valid UUID
  degree_diploma?: string;
  university_school?: string;
  field_of_study?: string;
  description?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  grade?: string;
  activities_societies?: string;
  skill_ids?: string[]; // Array of valid UUIDs
  media_url?: string;
}

interface UpdateCertificate {
  id?: string; // For existing records - must be valid UUID
  name?: string;
  issuing_authority?: string;
  issue_date?: string | null; // YYYY-MM-DD
  expiry_date?: string | null; // YYYY-MM-DD
  credential_id?: string;
  credential_url?: string;
  description?: string;
  skill_ids?: string[]; // Array of valid UUIDs
  media_url?: string;
}

interface UpdateProject {
  id?: string; // For existing records - must be valid UUID
  name?: string;
  description?: string;
  start_date?: string | null; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  is_current?: boolean;
  role?: string;
  responsibilities?: string[];
  technologies?: string[];
  tools?: string[];
  methodologies?: string[];
  is_confidential?: boolean;
  can_share_details?: boolean;
  url?: string;
  repository_url?: string;
  media_urls?: string[];
  skills_gained?: string[];
}

interface UpdateAward {
  id?: string; // For existing records - must be valid UUID
  title?: string;
  offered_by?: string;
  associated_with?: string;
  date?: string; // YYYY-MM-DD
  description?: string;
  media_url?: string;
  skill_ids?: string[]; // Array of valid UUIDs
}

interface UpdateVolunteering {
  id?: string; // For existing records - must be valid UUID
  role?: string;
  institution?: string;
  cause?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  is_current?: boolean;
  description?: string;
  media_url?: string;
}

interface UpdateSkill {
  id?: string; // For existing records - must be valid UUID
  name?: string;
  category?: string;
  description?: string;
  proficiency?: number; // 0-100
}

interface UpdateLanguage {
  id?: string; // For existing records - must be valid UUID
  language?: string;
  is_native?: boolean;
  oral_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
  written_proficiency?: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
}

interface UpdateAccomplishment {
  id?: string; // For existing records - must be valid UUID
  title?: string;
  description?: string;
  work_experience_id?: string | null; // Must be valid UUID
  resume_id?: string | null; // Must be valid UUID
}

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

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(basicInfo: UpdateBasicInfo): number {
  const requiredFields = [
    'first_name', 'last_name', 'title', 'current_position', 'industry',
    'bio', 'location', 'phone1', 'years_of_experience'
  ];
  
  const optionalFields = [
    'about', 'country', 'city', 'address', 'phone2', 'personal_website',
    'github_url', 'linkedin_url', 'professional_summary', 'gender',
    'date_of_birth', 'remote_preference', 'experience_level'
  ];
  
  let completedFields = 0;
  
  // Check required fields (weight: 2x)
  requiredFields.forEach(field => {
    if (basicInfo[field as keyof UpdateBasicInfo] && 
        basicInfo[field as keyof UpdateBasicInfo] !== '') {
      completedFields += 2;
    }
  });
  
  // Check optional fields (weight: 1x)
  optionalFields.forEach(field => {
    if (basicInfo[field as keyof UpdateBasicInfo] && 
        basicInfo[field as keyof UpdateBasicInfo] !== '') {
      completedFields += 1;
    }
  });
  
  const percentage = Math.round((completedFields / (requiredFields.length * 2 + optionalFields.length)) * 100);
  return Math.min(percentage, 100);
}

// Helper function to upload image to Supabase storage
async function uploadProfileImage(file: File, candidateId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${candidateId}_${Date.now()}.${fileExt}`;
  const filePath = `candidate_profile_image/${fileName}`;
  
  const { error } = await supabase.storage
    .from('candidate_profile_image')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('candidate_profile_image')
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
}

// Helper function to upload resume to Supabase storage
async function uploadResume(file: File, candidateId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${candidateId}_extracted_resume_${Date.now()}.${fileExt}`;
  const filePath = `candidate_resume/${fileName}`;
  
  const { error } = await supabase.storage
    .from('candidate_resume')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Failed to upload resume: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('candidate_resume')
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Candidate Profile Update API called');

    // 1. Authenticate user
    const accessToken = getTokenFromHeaders(request);
    
    console.log('🔐 Auth check - Access token found:', !!accessToken);
    
    if (!accessToken) {
      console.log('❌ No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(accessToken);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can update profiles.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const profileData = formData.get('profileData') as string;
    const profileImage = formData.get('profileImage') as File | null;
    const extractedResume = formData.get('extractedResume') as File | null;

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // 3. Parse profile data
    let updateData: UpdateProfileData;
    try {
      updateData = JSON.parse(profileData);
    } catch (parseError) {
      console.error('❌ Failed to parse profile data:', parseError);
      return NextResponse.json(
        { error: 'Invalid profile data format' },
        { status: 400 }
      );
    }

    // 4. Check if candidate exists, create if not
    // Note: Profile updates are allowed regardless of MIS approval status
    let existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      include: {
        work_experiences: true,
        educations: true,
        certificates: true,
        projects: true,
        awards: true,
        volunteering: true,
        skills: {
          include: {
            skill: true
          }
        },
        languages: true,
        accomplishments: true,
      }
    });

    // If candidate doesn't exist, create a basic profile first
    if (!existingCandidate) {
      console.log('🔄 Candidate profile not found, creating basic profile...');
      
      // Import the membership function
      const { generateMembershipNumberFromUserId } = await import('@/lib/membership');
      
      const membershipNo = generateMembershipNumberFromUserId(payload.userId);
      
      const newCandidate = await prisma.candidate.create({
        data: {
          user_id: payload.userId,
          first_name: updateData.basic_info?.first_name || null,
          last_name: updateData.basic_info?.last_name || null,
          title: updateData.basic_info?.title || null,
          current_position: updateData.basic_info?.current_position || null,
          industry: updateData.basic_info?.industry || null,
          bio: updateData.basic_info?.bio || null,
          about: updateData.basic_info?.about || null,
          country: updateData.basic_info?.country || null,
          city: updateData.basic_info?.city || null,
          location: updateData.basic_info?.location || null,
          address: updateData.basic_info?.address || null,
          phone1: updateData.basic_info?.phone1 || null,
          phone2: updateData.basic_info?.phone2 || null,
          personal_website: updateData.basic_info?.personal_website || null,
          nic: updateData.basic_info?.nic || null,
          passport: updateData.basic_info?.passport || null,
          remote_preference: updateData.basic_info?.remote_preference || 'flexible',
          experience_level: updateData.basic_info?.experience_level || 'entry',
          years_of_experience: updateData.basic_info?.years_of_experience || 0,
          expected_salary_min: updateData.basic_info?.expected_salary_min || 0,
          expected_salary_max: updateData.basic_info?.expected_salary_max || 0,
          currency: updateData.basic_info?.currency || 'LKR',
          availability_status: updateData.basic_info?.availability_status || 'available',
          availability_date: updateData.basic_info?.availability_date ? new Date(updateData.basic_info.availability_date) : null,
          github_url: updateData.basic_info?.github_url || null,
          linkedin_url: updateData.basic_info?.linkedin_url || null,
          professional_summary: updateData.basic_info?.professional_summary || null,
          total_years_experience: updateData.basic_info?.total_years_experience || 0,
          open_to_relocation: updateData.basic_info?.open_to_relocation || false,
          willing_to_travel: updateData.basic_info?.willing_to_travel || false,
          security_clearance: updateData.basic_info?.security_clearance || false,
          disability_status: updateData.basic_info?.disability_status || null,
          veteran_status: updateData.basic_info?.veteran_status || null,
          pronouns: updateData.basic_info?.pronouns || null,
          salary_visibility: updateData.basic_info?.salary_visibility || 'confidential',
          notice_period: updateData.basic_info?.notice_period || 30,
          work_authorization: updateData.basic_info?.work_authorization || null,
          visa_assistance_needed: updateData.basic_info?.visa_assistance_needed || false,
          work_availability: updateData.basic_info?.work_availability || 'full_time',
          interview_ready: updateData.basic_info?.interview_ready || false,
          pre_qualified: updateData.basic_info?.pre_qualified || false,
          profile_completion_percentage: 0,
          completedProfile: false,
          membership_no: membershipNo,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      
      // Now fetch the complete candidate with all relations
      existingCandidate = await prisma.candidate.findUnique({
        where: { user_id: payload.userId },
        include: {
          work_experiences: true,
          educations: true,
          certificates: true,
          projects: true,
          awards: true,
          volunteering: true,
          skills: {
            include: {
              skill: true
            }
          },
          languages: true,
          accomplishments: true,
        }
      });
      
      console.log('✅ Basic candidate profile created:', newCandidate.user_id);
    }

    // Ensure existingCandidate is not null at this point
    if (!existingCandidate) {
      console.error('❌ Failed to create or fetch candidate profile');
      return NextResponse.json(
        { error: 'Failed to create candidate profile' },
        { status: 500 }
      );
    }

    // 5. Handle profile image upload
    let profileImageUrl = existingCandidate.profile_image_url;
    if (profileImage) {
      try {
        // Validate image file
        if (!profileImage.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Only image files are allowed for profile image' },
            { status: 400 }
          );
        }

        // Check file size (5MB limit for images)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (profileImage.size > maxSize) {
          return NextResponse.json(
            { error: 'Profile image size must be less than 5MB' },
            { status: 400 }
          );
        }

        profileImageUrl = await uploadProfileImage(profileImage, payload.userId);
      } catch (uploadError) {
        console.error('❌ Profile image upload failed:', uploadError);
        return NextResponse.json(
          { 
            error: 'Failed to upload profile image',
            details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // 6. Handle resume upload if provided
    let resumeUrl = existingCandidate.resume_url;
    if (extractedResume) {
      try {
        // Validate resume file
        if (!extractedResume.type.includes('pdf')) {
          return NextResponse.json(
            { error: 'Only PDF files are allowed for resume' },
            { status: 400 }
          );
        }

        // Check file size (10MB limit for resumes)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (extractedResume.size > maxSize) {
          return NextResponse.json(
            { error: 'Resume size must be less than 10MB' },
            { status: 400 }
          );
        }

        resumeUrl = await uploadResume(extractedResume, payload.userId);
      } catch (uploadError) {
        console.error('❌ Resume upload failed:', uploadError);
        return NextResponse.json(
          { 
            error: 'Failed to upload resume',
            details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // 7. Calculate profile completion percentage
    const profileCompletionPercentage = calculateProfileCompletion(updateData.basic_info || {});

    // 8. Update candidate profile
    const updatedCandidate = await prisma.candidate.update({
      where: { user_id: payload.userId },
      data: {
        // Basic info
        first_name: updateData.basic_info?.first_name,
        last_name: updateData.basic_info?.last_name,
        gender: updateData.basic_info?.gender,
        date_of_birth: updateData.basic_info?.date_of_birth ? new Date(updateData.basic_info.date_of_birth) : null,
        title: updateData.basic_info?.title,
        current_position: updateData.basic_info?.current_position,
        industry: updateData.basic_info?.industry,
        bio: updateData.basic_info?.bio,
        about: updateData.basic_info?.about,
        country: updateData.basic_info?.country,
        city: updateData.basic_info?.city,
        location: updateData.basic_info?.location,
        address: updateData.basic_info?.address,
        phone1: updateData.basic_info?.phone1,
        phone2: updateData.basic_info?.phone2,
        personal_website: updateData.basic_info?.personal_website,
        nic: updateData.basic_info?.nic,
        passport: updateData.basic_info?.passport,
        remote_preference: updateData.basic_info?.remote_preference,
        experience_level: updateData.basic_info?.experience_level,
        years_of_experience: updateData.basic_info?.years_of_experience,
        expected_salary_min: updateData.basic_info?.expected_salary_min,
        expected_salary_max: updateData.basic_info?.expected_salary_max,
        currency: updateData.basic_info?.currency,
        profile_image_url: profileImageUrl,
        resume_url: resumeUrl,
        availability_status: updateData.basic_info?.availability_status,
        availability_date: updateData.basic_info?.availability_date ? new Date(updateData.basic_info.availability_date) : null,
        github_url: updateData.basic_info?.github_url,
        linkedin_url: updateData.basic_info?.linkedin_url,
        professional_summary: updateData.basic_info?.professional_summary,
        total_years_experience: updateData.basic_info?.total_years_experience,
        open_to_relocation: updateData.basic_info?.open_to_relocation,
        willing_to_travel: updateData.basic_info?.willing_to_travel,
        security_clearance: updateData.basic_info?.security_clearance,
        disability_status: updateData.basic_info?.disability_status,
        veteran_status: updateData.basic_info?.veteran_status,
        pronouns: updateData.basic_info?.pronouns,
        salary_visibility: updateData.basic_info?.salary_visibility,
        notice_period: updateData.basic_info?.notice_period,
        work_authorization: updateData.basic_info?.work_authorization,
        visa_assistance_needed: updateData.basic_info?.visa_assistance_needed,
        work_availability: updateData.basic_info?.work_availability,
        interview_ready: updateData.basic_info?.interview_ready,
        pre_qualified: updateData.basic_info?.pre_qualified,
        profile_completion_percentage: profileCompletionPercentage,
        completedProfile: profileCompletionPercentage >= 80,
        updated_at: new Date(),
      }
    });



    // 9. Update related records using batch operations and transactions
    
    const updatedRecords = await prisma.$transaction(async (tx) => {
      const results = {
        workExperiences: [] as string[],
        educations: [] as string[],
        certificates: [] as string[],
        projects: [] as string[],
        awards: [] as string[],
        volunteering: [] as string[],
        skills: [] as string[],
        languages: [] as string[],
        accomplishments: [] as string[]
      };

      // Batch process work experiences
      if (updateData.work_experiences && updateData.work_experiences.length > 0) {
        const workExpPromises = updateData.work_experiences.map(async (exp) => {
          if (exp.id && isValidUUID(exp.id)) {
            try {
              const updatedExp = await tx.workExperience.update({
                where: { id: exp.id },
                data: {
                  title: exp.title,
                  company: exp.company,
                  employment_type: exp.employment_type,
                  is_current: exp.is_current,
                  start_date: exp.start_date ? new Date(exp.start_date) : null,
                  end_date: exp.end_date ? new Date(exp.end_date) : null,
                  location: exp.location,
                  description: exp.description,
                  skill_ids: exp.skill_ids || [],
                  media_url: exp.media_url,
                  updated_at: new Date(),
                }
              });
              return updatedExp.id;
            } catch (error) {
              console.error('❌ Failed to update work experience:', exp.id, error);
              return null;
            }
          } else {
            try {
              const newExp = await tx.workExperience.create({
                data: {
                  candidate_id: payload.userId,
                  title: exp.title!,
                  company: exp.company!,
                  employment_type: exp.employment_type!,
                  is_current: exp.is_current!,
                  start_date: exp.start_date ? new Date(exp.start_date) : null,
                  end_date: exp.end_date ? new Date(exp.end_date) : null,
                  location: exp.location,
                  description: exp.description,
                  skill_ids: exp.skill_ids || [],
                  media_url: exp.media_url,
                }
              });
              return newExp.id;
            } catch (error) {
              console.error('❌ Failed to create work experience:', error);
              return null;
            }
          }
        });

        const workExpResults = await Promise.all(workExpPromises);
        results.workExperiences = workExpResults.filter(id => id !== null) as string[];
      }

      // Batch process educations
      if (updateData.educations && updateData.educations.length > 0) {
        const eduPromises = updateData.educations.map(async (edu) => {
          if (edu.id && isValidUUID(edu.id)) {
            try {
              const updatedEdu = await tx.education.update({
                where: { id: edu.id },
                data: {
                  degree_diploma: edu.degree_diploma,
                  field_of_study: edu.field_of_study,
                  university_school: edu.university_school,
                  description: edu.description,
                  start_date: edu.start_date ? new Date(edu.start_date) : null,
                  end_date: edu.end_date ? new Date(edu.end_date) : null,
                  grade: edu.grade,
                  activities_societies: edu.activities_societies,
                  skill_ids: edu.skill_ids || [],
                  media_url: edu.media_url,
                  updated_at: new Date(),
                }
              });
              return updatedEdu.id;
            } catch (error) {
              console.error('❌ Failed to update education:', edu.id, error);
              return null;
            }
          } else {
            try {
              const newEdu = await tx.education.create({
                data: {
                  candidate_id: payload.userId,
                  degree_diploma: edu.degree_diploma!,
                  field_of_study: edu.field_of_study!,
                  university_school: edu.university_school!,
                  description: edu.description,
                  start_date: edu.start_date ? new Date(edu.start_date) : null,
                  end_date: edu.end_date ? new Date(edu.end_date) : null,
                  grade: edu.grade,
                  activities_societies: edu.activities_societies,
                  skill_ids: edu.skill_ids || [],
                  media_url: edu.media_url,
                }
              });
              return newEdu.id;
            } catch (error) {
              console.error('❌ Failed to create education:', error);
              return null;
            }
          }
        });

        const eduResults = await Promise.all(eduPromises);
        results.educations = eduResults.filter(id => id !== null) as string[];
      }

      // Note: Skills are handled differently - they need to be linked to existing skills in the system
      // For now, we'll skip skills processing to avoid complexity
      console.log('ℹ️ Skills processing skipped - requires different implementation');

      // Batch process languages
      if (updateData.languages && updateData.languages.length > 0) {
        const langPromises = updateData.languages.map(async (lang) => {
          if (lang.id && isValidUUID(lang.id)) {
            try {
              const updatedLang = await tx.language.update({
                where: { id: lang.id },
                data: {
                  language: lang.language,
                  is_native: lang.is_native,
                  oral_proficiency: lang.oral_proficiency,
                  written_proficiency: lang.written_proficiency,
                  updated_at: new Date(),
                }
              });
              return updatedLang.id;
            } catch (error) {
              console.error('❌ Failed to update language:', lang.id, error);
              return null;
            }
          } else {
            try {
              const newLang = await tx.language.create({
                data: {
                  candidate_id: payload.userId,
                  language: lang.language!,
                  is_native: lang.is_native!,
                  oral_proficiency: lang.oral_proficiency,
                  written_proficiency: lang.written_proficiency,
                }
              });
              return newLang.id;
            } catch (error) {
              console.error('❌ Failed to create language:', error);
              return null;
            }
          }
        });

        const langResults = await Promise.all(langPromises);
        results.languages = langResults.filter(id => id !== null) as string[];
      }

      // Batch process other record types (certificates, projects, awards, volunteering, accomplishments)
      // Add similar batch processing for other record types here...
      
      return results;
    });

    // Update educations
    if (updateData.educations && updateData.educations.length > 0) {
      for (const edu of updateData.educations) {
        if (edu.id) {
          // Validate UUID format
          if (!isValidUUID(edu.id)) {
            console.error('❌ Invalid UUID format for education:', edu.id);
            continue;
          }

          try {
            // Update existing record
            const updatedEdu = await prisma.education.update({
              where: { id: edu.id },
              data: {
                degree_diploma: edu.degree_diploma,
                university_school: edu.university_school,
                field_of_study: edu.field_of_study,
                description: edu.description,
                start_date: edu.start_date ? new Date(edu.start_date) : null,
                end_date: edu.end_date ? new Date(edu.end_date) : null,
                grade: edu.grade,
                activities_societies: edu.activities_societies,
                skill_ids: edu.skill_ids || [],
                media_url: edu.media_url,
                updated_at: new Date(),
              }
            });
            updatedRecords.educations.push(updatedEdu.id);
            console.log('✅ Education updated:', updatedEdu.id);
          } catch (updateError) {
            console.error('❌ Failed to update education:', edu.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newEdu = await prisma.education.create({
              data: {
                candidate_id: payload.userId,
                degree_diploma: edu.degree_diploma!,
                university_school: edu.university_school!,
                field_of_study: edu.field_of_study,
                description: edu.description,
                start_date: edu.start_date ? new Date(edu.start_date) : null,
                end_date: edu.end_date ? new Date(edu.end_date) : null,
                grade: edu.grade,
                activities_societies: edu.activities_societies,
                skill_ids: edu.skill_ids || [],
                media_url: edu.media_url,
              }
            });
            updatedRecords.educations.push(newEdu.id);
            console.log('✅ New education created:', newEdu.id);
          } catch (createError) {
            console.error('❌ Failed to create education:', createError);
            continue;
          }
        }
      }
    }

    // Update skills (optimized with bulk operations)
    if (updateData.skills && updateData.skills.length > 0) {
      console.log(`🔄 Processing ${updateData.skills.length} skills...`);
      try {
        // Separate skills into updates and creates
        const skillsToUpdate = updateData.skills.filter(skill => skill.id && isValidUUID(skill.id));
        const skillsToCreate = updateData.skills.filter(skill => !skill.id && skill.name);
        
        console.log(`📊 Skills to update: ${skillsToUpdate.length}, Skills to create: ${skillsToCreate.length}`);

        // Bulk update existing skills
        if (skillsToUpdate.length > 0) {
          const updatePromises = skillsToUpdate.map(skill => 
            prisma.candidateSkill.update({
              where: { id: skill.id! },
              data: {
                proficiency: skill.proficiency,
                updated_at: new Date(),
              }
            }).catch(error => {
              console.error('❌ Failed to update skill:', skill.id, error);
              return null;
            })
          );
          
          const updateResults = await Promise.all(updatePromises);
          const successfulUpdates = updateResults.filter(result => result !== null);
          updatedRecords.skills.push(...successfulUpdates.map(skill => skill!.id));
          console.log(`✅ ${successfulUpdates.length} skills updated in bulk`);
        }

        // Bulk create new skills
        if (skillsToCreate.length > 0) {
          // Get all existing skills to avoid duplicates
          const existingSkills = await prisma.skill.findMany({
            where: { 
              name: { in: skillsToCreate.map(skill => skill.name!) }
            }
          });

          const existingSkillNames = new Set(existingSkills.map(skill => skill.name));
          
          // Create missing skills in bulk
          const skillsToCreateInDb = skillsToCreate
            .filter(skill => !existingSkillNames.has(skill.name!))
            .map(skill => ({
              name: skill.name!,
              category: skill.category,
              description: skill.description,
              is_active: true,
            }));

          let newSkillRecords: any[] = [];
          if (skillsToCreateInDb.length > 0) {
            newSkillRecords = await prisma.skill.createMany({
              data: skillsToCreateInDb,
              skipDuplicates: true
            }).then(() => 
              prisma.skill.findMany({
                where: { 
                  name: { in: skillsToCreateInDb.map(skill => skill.name) }
                }
              })
            );
          }

          // Combine existing and new skills
          const allSkillRecords = [...existingSkills, ...newSkillRecords];
          const skillMap = new Map(allSkillRecords.map(skill => [skill.name, skill]));

          // Get existing candidate skills to avoid duplicates
          const existingCandidateSkills = await prisma.candidateSkill.findMany({
            where: {
              candidate_id: payload.userId,
              skill_id: { in: allSkillRecords.map(skill => skill.id) }
            }
          });

          const existingCandidateSkillIds = new Set(
            existingCandidateSkills.map(cs => cs.skill_id)
          );

          // Create candidate skills in bulk (only for non-existing combinations)
          const candidateSkillsToCreate = skillsToCreate
            .map(skill => {
              const skillRecord = skillMap.get(skill.name!);
              if (skillRecord && !existingCandidateSkillIds.has(skillRecord.id)) {
                return {
                  candidate_id: payload.userId,
                  skill_id: skillRecord.id,
                  skill_source: 'manual_update',
                  proficiency: skill.proficiency || 50,
                  years_of_experience: 0,
                  source_title: 'Profile Update',
                  source_type: 'manual_update',
                };
              }
              return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (candidateSkillsToCreate.length > 0) {
            const createdCandidateSkills = await prisma.candidateSkill.createMany({
              data: candidateSkillsToCreate,
              skipDuplicates: true
            }).then(() =>
              prisma.candidateSkill.findMany({
                where: {
                  candidate_id: payload.userId,
                  skill_id: { in: candidateSkillsToCreate.map(cs => cs.skill_id) }
                }
              })
            );

            updatedRecords.skills.push(...createdCandidateSkills.map(skill => skill.id));
            console.log(`✅ ${createdCandidateSkills.length} new skills created in bulk`);
          }
        }
        console.log('✅ Skills processing completed');
      } catch (skillError) {
        console.error('❌ Error processing skills:', skillError);
      }
    }

    // Update projects
    if (updateData.projects && updateData.projects.length > 0) {
      for (const project of updateData.projects) {
        if (project.id) {
          // Validate UUID format
          if (!isValidUUID(project.id)) {
            console.error('❌ Invalid UUID format for project:', project.id);
            continue;
          }

          try {
            // Update existing record
            const updatedProject = await prisma.project.update({
              where: { id: project.id },
              data: {
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
                updated_at: new Date(),
              }
            });
            updatedRecords.projects.push(updatedProject.id);
            console.log('✅ Project updated:', updatedProject.id);
          } catch (updateError) {
            console.error('❌ Failed to update project:', project.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newProject = await prisma.project.create({
              data: {
                candidate_id: payload.userId,
                name: project.name!,
                description: project.description!,
                start_date: project.start_date ? new Date(project.start_date) : null,
                end_date: project.end_date ? new Date(project.end_date) : null,
                is_current: project.is_current!,
                role: project.role,
                responsibilities: project.responsibilities || [],
                technologies: project.technologies || [],
                tools: project.tools || [],
                methodologies: project.methodologies || [],
                is_confidential: project.is_confidential!,
                can_share_details: project.can_share_details!,
                url: project.url,
                repository_url: project.repository_url,
                media_urls: project.media_urls || [],
                skills_gained: project.skills_gained || [],
              }
            });
            updatedRecords.projects.push(newProject.id);
            console.log('✅ New project created:', newProject.id);
          } catch (createError) {
            console.error('❌ Failed to create project:', createError);
            continue;
          }
        }
      }
    }

    // Update certificates
    if (updateData.certificates && updateData.certificates.length > 0) {
      for (const cert of updateData.certificates) {
        if (cert.id) {
          // Validate UUID format
          if (!isValidUUID(cert.id)) {
            console.error('❌ Invalid UUID format for certificate:', cert.id);
            continue;
          }

          try {
            // Update existing record
            const updatedCert = await prisma.certificate.update({
              where: { id: cert.id },
              data: {
                name: cert.name,
                issuing_authority: cert.issuing_authority,
                issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
                expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
                credential_id: cert.credential_id,
                credential_url: cert.credential_url,
                description: cert.description,
                skill_ids: cert.skill_ids || [],
                media_url: cert.media_url,
                updated_at: new Date(),
              }
            });
            updatedRecords.certificates.push(updatedCert.id);
            console.log('✅ Certificate updated:', updatedCert.id);
          } catch (updateError) {
            console.error('❌ Failed to update certificate:', cert.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newCert = await prisma.certificate.create({
              data: {
                candidate_id: payload.userId,
                name: cert.name!,
                issuing_authority: cert.issuing_authority!,
                issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
                expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
                credential_id: cert.credential_id,
                credential_url: cert.credential_url,
                description: cert.description,
                skill_ids: cert.skill_ids || [],
                media_url: cert.media_url,
              }
            });
            updatedRecords.certificates.push(newCert.id);
            console.log('✅ New certificate created:', newCert.id);
          } catch (createError) {
            console.error('❌ Failed to create certificate:', createError);
            continue;
          }
        }
      }
    }

    // Update awards
    if (updateData.awards && updateData.awards.length > 0) {
      for (const award of updateData.awards) {
        if (award.id) {
          // Validate UUID format
          if (!isValidUUID(award.id)) {
            console.error('❌ Invalid UUID format for award:', award.id);
            continue;
          }

          try {
            // Update existing record
            const updatedAward = await prisma.award.update({
              where: { id: award.id },
              data: {
                title: award.title,
                offered_by: award.offered_by,
                associated_with: award.associated_with,
                date: award.date ? new Date(award.date) : null,
                description: award.description,
                media_url: award.media_url,
                skill_ids: award.skill_ids || [],
                updated_at: new Date(),
              }
            });
            updatedRecords.awards.push(updatedAward.id);
            console.log('✅ Award updated:', updatedAward.id);
          } catch (updateError) {
            console.error('❌ Failed to update award:', award.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newAward = await prisma.award.create({
              data: {
                candidate_id: payload.userId,
                title: award.title!,
                offered_by: award.offered_by!,
                associated_with: award.associated_with,
                date: award.date ? new Date(award.date) : null,
                description: award.description,
                media_url: award.media_url,
                skill_ids: award.skill_ids || [],
              }
            });
            updatedRecords.awards.push(newAward.id);
            console.log('✅ New award created:', newAward.id);
          } catch (createError) {
            console.error('❌ Failed to create award:', createError);
            continue;
          }
        }
      }
    }

    // Update volunteering
    if (updateData.volunteering && updateData.volunteering.length > 0) {
      for (const vol of updateData.volunteering) {
        if (vol.id) {
          // Validate UUID format
          if (!isValidUUID(vol.id)) {
            console.error('❌ Invalid UUID format for volunteering:', vol.id);
            continue;
          }

          try {
            // Update existing record
            const updatedVol = await prisma.volunteering.update({
              where: { id: vol.id },
              data: {
                role: vol.role,
                institution: vol.institution,
                cause: vol.cause,
                start_date: vol.start_date ? new Date(vol.start_date) : null,
                end_date: vol.end_date ? new Date(vol.end_date) : null,
                is_current: vol.is_current,
                description: vol.description,
                media_url: vol.media_url,
                updated_at: new Date(),
              }
            });
            updatedRecords.volunteering.push(updatedVol.id);
            console.log('✅ Volunteering updated:', updatedVol.id);
          } catch (updateError) {
            console.error('❌ Failed to update volunteering:', vol.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newVol = await prisma.volunteering.create({
              data: {
                candidate_id: payload.userId,
                role: vol.role!,
                institution: vol.institution!,
                cause: vol.cause,
                start_date: vol.start_date ? new Date(vol.start_date) : null,
                end_date: vol.end_date ? new Date(vol.end_date) : null,
                is_current: vol.is_current!,
                description: vol.description,
                media_url: vol.media_url,
              }
            });
            updatedRecords.volunteering.push(newVol.id);
            console.log('✅ New volunteering created:', newVol.id);
          } catch (createError) {
            console.error('❌ Failed to create volunteering:', createError);
            continue;
          }
        }
      }
    }

    // Update languages
    if (updateData.languages && updateData.languages.length > 0) {
      for (const lang of updateData.languages) {
        if (lang.id) {
          // Validate UUID format
          if (!isValidUUID(lang.id)) {
            console.error('❌ Invalid UUID format for language:', lang.id);
            continue;
          }

          try {
            // Update existing record
            const updatedLang = await prisma.language.update({
              where: { id: lang.id },
              data: {
                language: lang.language,
                is_native: lang.is_native,
                oral_proficiency: lang.oral_proficiency,
                written_proficiency: lang.written_proficiency,
                updated_at: new Date(),
              }
            });
            updatedRecords.languages.push(updatedLang.id);
            console.log('✅ Language updated:', updatedLang.id);
          } catch (updateError) {
            console.error('❌ Failed to update language:', lang.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newLang = await prisma.language.create({
              data: {
                candidate_id: payload.userId,
                language: lang.language!,
                is_native: lang.is_native!,
                oral_proficiency: lang.oral_proficiency,
                written_proficiency: lang.written_proficiency,
              }
            });
            updatedRecords.languages.push(newLang.id);
            console.log('✅ New language created:', newLang.id);
          } catch (createError) {
            console.error('❌ Failed to create language:', createError);
            continue;
          }
        }
      }
    }

    console.log('✅ All related records updated successfully');

    // 10. Return updated profile data
    console.log('✅ Profile update completed successfully');
    console.log('📊 Updated records:', updatedRecords);
    
    return NextResponse.json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: {
        candidate_id: updatedCandidate.user_id,
        profile: {
          first_name: updatedCandidate.first_name,
          last_name: updatedCandidate.last_name,
          title: updatedCandidate.title,
          current_position: updatedCandidate.current_position,
          industry: updatedCandidate.industry,
          profile_image_url: updatedCandidate.profile_image_url,
          profile_completion_percentage: updatedCandidate.profile_completion_percentage,
          completedProfile: updatedCandidate.completedProfile,
        },
        updated_records: updatedRecords,
        profile_image: profileImage ? {
          uploaded: true,
          url: profileImageUrl,
          filename: profileImage.name,
          size: profileImage.size,
        } : {
          uploaded: false,
          url: existingCandidate.profile_image_url,
        },
        resume: extractedResume ? {
          uploaded: true,
          url: resumeUrl,
          filename: extractedResume.name,
          size: extractedResume.size,
        } : {
          uploaded: false,
          url: existingCandidate.resume_url,
        }
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Get Candidate Profile API called');

    // 1. Authenticate user
    const accessToken = getTokenFromHeaders(request);
    
    console.log('🔐 GET Auth check - Access token found:', !!accessToken);
    
    if (!accessToken) {
      console.log('❌ GET No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(accessToken);
    console.log('🔐 GET Token verification result:', !!payload, payload?.userId, payload?.role);
    
    if (!payload || !payload.userId) {
      console.log('❌ GET Invalid token or missing userId');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      console.log('❌ GET Invalid role:', payload.role);
      return NextResponse.json(
        { error: 'Access denied. Only candidates can view profiles.' },
        { status: 401 }
      );
    }

    // 2. Get candidate profile with all related data
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      include: {
        work_experiences: true,
        educations: true,
        certificates: true,
        projects: true,
        awards: true,
        volunteering: true,
        skills: {
          include: {
            skill: true
          }
        },
        languages: true,
        accomplishments: true,
        resumes: true,
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidate
    });

  } catch (error) {
    console.error('❌ Profile retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

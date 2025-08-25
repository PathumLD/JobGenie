import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types based on schema.prisma - following exact structure
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
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
  const totalFields = requiredFields.length + optionalFields.length;
  
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
  
  const { data, error } = await supabase.storage
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

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Candidate Profile Update API called');

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
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
      console.log('✅ Profile data parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse profile data:', parseError);
      return NextResponse.json(
        { error: 'Invalid profile data format' },
        { status: 400 }
      );
    }

    // 4. Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
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

    if (!existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found. Create profile first.' },
        { status: 404 }
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

        console.log('📸 Uploading profile image:', profileImage.name, 'Size:', profileImage.size);
        profileImageUrl = await uploadProfileImage(profileImage, payload.userId);
        console.log('✅ Profile image uploaded successfully:', profileImageUrl);
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

    // 6. Calculate profile completion percentage
    const profileCompletionPercentage = calculateProfileCompletion(updateData.basic_info || {});

    // 7. Update candidate profile
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
        availability_status: updateData.basic_info?.availability_status,
        availability_date: updateData.basic_info?.availability_date ? new Date(updateData.basic_info.availability_date) : null,
        github_url: updateData.basic_info?.github_url,
        linkedin_url: updateData.basic_info?.linkedin_url,
        resume_url: updateData.basic_info?.resume_url,
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

    console.log('✅ Candidate profile updated:', updatedCandidate.user_id);

    // 8. Update related records if provided
    const updatedRecords: {
      workExperiences: string[];
      educations: string[];
      certificates: string[];
      projects: string[];
      awards: string[];
      volunteering: string[];
      skills: string[];
      languages: string[];
      accomplishments: string[];
    } = {
      workExperiences: [],
      educations: [],
      certificates: [],
      projects: [],
      awards: [],
      volunteering: [],
      skills: [],
      languages: [],
      accomplishments: []
    };

    // Update work experiences
    if (updateData.work_experiences && updateData.work_experiences.length > 0) {
      for (const exp of updateData.work_experiences) {
        if (exp.id) {
          // Validate UUID format
          if (!isValidUUID(exp.id)) {
            console.error('❌ Invalid UUID format for work experience:', exp.id);
            continue;
          }

          try {
            // Update existing record
            const updatedExp = await prisma.workExperience.update({
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
            updatedRecords.workExperiences.push(updatedExp.id);
            console.log('✅ Work experience updated:', updatedExp.id);
          } catch (updateError) {
            console.error('❌ Failed to update work experience:', exp.id, updateError);
            continue;
          }
        } else {
          // Create new record
          try {
            const newExp = await prisma.workExperience.create({
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
            updatedRecords.workExperiences.push(newExp.id);
            console.log('✅ New work experience created:', newExp.id);
          } catch (createError) {
            console.error('❌ Failed to create work experience:', createError);
            continue;
          }
        }
      }
    }

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

    // Update skills
    if (updateData.skills && updateData.skills.length > 0) {
      for (const skill of updateData.skills) {
        if (skill.id) {
          // Validate UUID format
          if (!isValidUUID(skill.id)) {
            console.error('❌ Invalid UUID format for skill:', skill.id);
            continue;
          }

          try {
            // Update existing record
            const updatedSkill = await prisma.candidateSkill.update({
              where: { id: skill.id },
              data: {
                proficiency: skill.proficiency,
                updated_at: new Date(),
              }
            });
            updatedRecords.skills.push(updatedSkill.id);
            console.log('✅ Skill updated:', updatedSkill.id);
          } catch (updateError) {
            console.error('❌ Failed to update skill:', skill.id, updateError);
            continue;
          }
        } else {
          // Create new skill and candidate skill
          try {
            let skillRecord = await prisma.skill.findUnique({
              where: { name: skill.name! }
            });

            if (!skillRecord) {
              skillRecord = await prisma.skill.create({
                data: {
                  name: skill.name!,
                  category: skill.category,
                  description: skill.description,
                  is_active: true,
                }
              });
            }

            const newCandidateSkill = await prisma.candidateSkill.create({
              data: {
                candidate_id: payload.userId,
                skill_id: skillRecord.id,
                skill_source: 'manual_update',
                proficiency: skill.proficiency || 50,
                years_of_experience: 0,
                source_title: 'Profile Update',
                source_type: 'manual_update',
              }
            });
            updatedRecords.skills.push(newCandidateSkill.id);
            console.log('✅ New skill created:', newCandidateSkill.id);
          } catch (createError) {
            console.error('❌ Failed to create skill:', createError);
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

    // 9. Return updated profile data
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can view profiles.' },
        { status: 403 }
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

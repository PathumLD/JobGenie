import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for profile creation
interface BasicInfo {
  first_name: string;
  last_name: string;
  title: string;
  current_position?: string | null;
  industry?: string | null;
  bio?: string | null;
  about?: string | null;
  country?: string | null;
  city?: string | null;
  location: string;
  phone1: string;
  phone2?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  personal_website?: string | null;
  years_of_experience?: number | null;
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | null;
  profile_image_url?: string | null;
}

interface WorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
}

interface Education {
  degree_diploma: string;
  university_school: string;
  field_of_study?: string | null;
  start_date: string;
  end_date?: string | null;
  grade?: string | null;
}

interface Skill {
  name: string;
  category?: string | null;
}

interface Project {
  name: string;
  description: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  role?: string | null;
  responsibilities: string[];
  technologies: string[];
  tools: string[];
  methodologies: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  url?: string | null;
  repository_url?: string | null;
  media_urls: string[];
  skills_gained: string[];
}

interface Certificate {
  name: string;
  issuing_authority: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  description?: string | null;
  skill_ids: string[];
  media_url?: string | null;
}

interface Volunteering {
  role: string;
  institution: string;
  cause?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  media_url?: string | null;
}

interface Award {
  title: string;
  offered_by: string;
  associated_with?: string | null;
  date: string;
  description?: string | null;
  media_url?: string | null;
  skill_ids: string[];
}

interface ProfileFormData {
  basic_info: BasicInfo;
  work_experiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  volunteering: Volunteering[];
  awards: Award[];
}

interface CreateProfileRequest {
  profileData: ProfileFormData;
  extractedResume?: File | null;
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Candidate Profile Creation API called');

    // 1. Authenticate user
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 2. Parse request data
    const formData = await request.formData();
    const profileDataStr = formData.get('profileData') as string;
    const extractedResume = formData.get('extractedResume') as File | null;

    if (!profileDataStr) {
      return NextResponse.json(
        { success: false, error: 'Profile data is required' },
        { status: 400 }
      );
    }

    let profileData: ProfileFormData;
    try {
      profileData = JSON.parse(profileDataStr);
    } catch (parseError) {
      console.error('❌ Failed to parse profile data:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid profile data format' },
        { status: 400 }
      );
    }

    // 3. Check if candidate already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId }
    });

    if (existingCandidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate profile already exists. Use update API instead.' },
        { status: 400 }
      );
    }

    // 4. Handle resume upload if provided
    let resumeUrl: string | null = null;
    if (extractedResume) {
      try {
        console.log('📄 Uploading extracted resume:', extractedResume.name);
        resumeUrl = await uploadResume(extractedResume, payload.userId);
        console.log('✅ Resume uploaded successfully:', resumeUrl);
      } catch (uploadError) {
        console.error('❌ Resume upload failed:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload resume' },
          { status: 500 }
        );
      }
    }

    // 5. Create candidate profile
    const candidate = await prisma.candidate.create({
      data: {
        user_id: payload.userId,
        first_name: profileData.basic_info.first_name,
        last_name: profileData.basic_info.last_name,
        title: profileData.basic_info.title,
        current_position: profileData.basic_info.current_position,
        industry: profileData.basic_info.industry,
        bio: profileData.basic_info.bio,
        about: profileData.basic_info.about,
        country: profileData.basic_info.country,
        city: profileData.basic_info.city,
        location: profileData.basic_info.location,
        phone1: profileData.basic_info.phone1,
        phone2: profileData.basic_info.phone2,
        github_url: profileData.basic_info.github_url,
        linkedin_url: profileData.basic_info.linkedin_url,
        personal_website: profileData.basic_info.personal_website,
        years_of_experience: profileData.basic_info.years_of_experience,
        experience_level: profileData.basic_info.experience_level,
        profile_image_url: profileData.basic_info.profile_image_url,
        resume_url: resumeUrl,
        profile_completion_percentage: 100,
        completedProfile: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    console.log('✅ Candidate profile created:', candidate.user_id);

    // 6. Create work experiences
    const workExperiences = [];
    for (const exp of profileData.work_experiences) {
      const workExp = await prisma.workExperience.create({
        data: {
          candidate_id: payload.userId,
          title: exp.title,
          company: exp.company,
          employment_type: exp.employment_type,
          is_current: exp.is_current,
          start_date: new Date(exp.start_date),
          end_date: exp.end_date ? new Date(exp.end_date) : null,
          location: exp.location,
          description: exp.description,
          skill_ids: [],
          media_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      workExperiences.push(workExp);
    }
    console.log(`✅ Created ${workExperiences.length} work experiences`);

    // 7. Create educations
    const educations = [];
    for (const edu of profileData.educations) {
      const education = await prisma.education.create({
        data: {
          candidate_id: payload.userId,
          degree_diploma: edu.degree_diploma,
          university_school: edu.university_school,
          field_of_study: edu.field_of_study,
          start_date: new Date(edu.start_date),
          end_date: edu.end_date ? new Date(edu.end_date) : null,
          grade: edu.grade,
          skill_ids: [],
          media_url: null,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      educations.push(education);
    }
    console.log(`✅ Created ${educations.length} education records`);

    // 8. Create skills
    const skills = [];
    for (const skillData of profileData.skills) {
      // Find or create skill
      let skill = await prisma.skill.findUnique({
        where: { name: skillData.name }
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            name: skillData.name,
            category: skillData.category,
            description: null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
      }

      // Create candidate skill
      const candidateSkill = await prisma.candidateSkill.create({
        data: {
          candidate_id: payload.userId,
          skill_id: skill.id,
          skill_source: 'profile_creation',
          proficiency: 50,
          years_of_experience: 0,
          source_title: 'Profile Creation',
          source_type: 'profile_creation',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      skills.push(candidateSkill);
    }
    console.log(`✅ Created ${skills.length} skills`);

    // 9. Create projects
    const projects = [];
    for (const proj of profileData.projects) {
      const project = await prisma.project.create({
        data: {
          candidate_id: payload.userId,
          name: proj.name,
          description: proj.description,
          start_date: proj.start_date ? new Date(proj.start_date) : null,
          end_date: proj.end_date ? new Date(proj.end_date) : null,
          is_current: proj.is_current,
          role: proj.role,
          responsibilities: proj.responsibilities,
          technologies: proj.technologies,
          tools: proj.tools,
          methodologies: proj.methodologies,
          is_confidential: proj.is_confidential,
          can_share_details: proj.can_share_details,
          url: proj.url,
          repository_url: proj.repository_url,
          media_urls: proj.media_urls,
          skills_gained: proj.skills_gained,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      projects.push(project);
    }
    console.log(`✅ Created ${projects.length} projects`);

    // 10. Create certificates
    const certificates = [];
    for (const cert of profileData.certificates) {
      const certificate = await prisma.certificate.create({
        data: {
          candidate_id: payload.userId,
          name: cert.name,
          issuing_authority: cert.issuing_authority,
          issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
          expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
          credential_id: cert.credential_id,
          credential_url: cert.credential_url,
          description: cert.description,
          skill_ids: cert.skill_ids,
          media_url: cert.media_url,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      certificates.push(certificate);
    }
    console.log(`✅ Created ${certificates.length} certificates`);

    // 11. Create volunteering experiences
    const volunteering = [];
    for (const vol of profileData.volunteering) {
      const volunteerExp = await prisma.volunteering.create({
        data: {
          candidate_id: payload.userId,
          role: vol.role,
          institution: vol.institution,
          cause: vol.cause,
          start_date: new Date(vol.start_date),
          end_date: vol.end_date ? new Date(vol.end_date) : null,
          is_current: vol.is_current,
          description: vol.description,
          media_url: vol.media_url,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      volunteering.push(volunteerExp);
    }
    console.log(`✅ Created ${volunteering.length} volunteering experiences`);

    // 12. Create awards
    const awards = [];
    for (const awardData of profileData.awards) {
      const award = await prisma.award.create({
        data: {
          candidate_id: payload.userId,
          title: awardData.title,
          offered_by: awardData.offered_by,
          associated_with: awardData.associated_with,
          date: new Date(awardData.date),
          description: awardData.description,
          media_url: awardData.media_url,
          skill_ids: awardData.skill_ids,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      awards.push(award);
    }
    console.log(`✅ Created ${awards.length} awards`);

    // 13. Create resume record if resume was uploaded
    let resumeRecord = null;
    if (resumeUrl) {
      resumeRecord = await prisma.resume.create({
        data: {
          candidate_id: payload.userId,
          file_name: extractedResume?.name || 'extracted_resume',
          file_url: resumeUrl,
          file_size: extractedResume?.size || 0,
          file_type: extractedResume?.type || 'application/pdf',
          upload_source: 'cv_extraction',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      console.log('✅ Resume record created');
    }

    console.log('✅ All profile data created successfully');

    // 14. Return success response
    return NextResponse.json({
      success: true,
      message: 'Candidate profile created successfully',
      data: {
        candidate_id: candidate.user_id,
        profile: {
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          title: candidate.title,
          current_position: candidate.current_position,
          industry: candidate.industry,
          profile_image_url: candidate.profile_image_url,
          resume_url: candidate.resume_url,
          profile_completion_percentage: candidate.profile_completion_percentage,
          completedProfile: candidate.completedProfile,
        },
        created_records: {
          work_experiences: workExperiences.length,
          educations: educations.length,
          skills: skills.length,
          projects: projects.length,
          certificates: certificates.length,
          volunteering: volunteering.length,
          awards: awards.length,
          resume: resumeRecord ? 1 : 0,
        }
      }
    });

  } catch (error) {
    console.error('❌ Profile creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CandidateProfileResponse, CandidateProfileErrorResponse, CandidateProfileSection } from '@/types/candidate-profile';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CandidateProfileResponse | CandidateProfileErrorResponse>> {
  try {
    const { id: candidateId } = await params;

    if (!candidateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_PARAMETER',
          message: 'Candidate ID is required'
        } as CandidateProfileErrorResponse,
        { status: 400 }
      );
    }

    // Get JWT token from Authorization header
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as CandidateProfileErrorResponse,
        { status: 401 }
      );
    }

    // Verify JWT token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as CandidateProfileErrorResponse,
        { status: 401 }
      );
    }

    // Check if user is trying to access their own profile or has permission
    // For now, we'll allow users to access their own profile
    if (decodedToken.userId !== candidateId && decodedToken.role !== 'mis') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only access your own profile'
        } as CandidateProfileErrorResponse,
        { status: 403 }
      );
    }

    // Fetch candidate with all related data
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: candidateId },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            address: true,
            phone1: true,
            phone2: true,
            email: true
          }
        },
        work_experiences: {
          include: {
            accomplishments: true
          },
          orderBy: {
            start_date: 'desc'
          }
        },
        educations: {
          orderBy: {
            start_date: 'desc'
          }
        },
        skills: {
          include: {
            skill: true
          },
          orderBy: {
            years_of_experience: 'desc'
          }
        },
        projects: {
          orderBy: {
            start_date: 'desc'
          }
        },
        certificates: {
          orderBy: {
            issue_date: 'desc'
          }
        },
        languages: {
          orderBy: {
            is_native: 'desc'
          }
        },
        awards: {
          orderBy: {
            date: 'desc'
          }
        },
        volunteering: {
          orderBy: {
            start_date: 'desc'
          }
        },
        accomplishments: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Candidate profile not found'
        } as CandidateProfileErrorResponse,
        { status: 404 }
      );
    }

    // Build profile sections
    const sections = buildProfileSections(candidate);

    // Calculate profile summary
    const profileSummary = calculateProfileSummary(candidate);

    const response: CandidateProfileResponse = {
      success: true,
      message: 'Candidate profile retrieved successfully',
      data: {
        candidate_id: candidateId,
        sections,
        profile_summary: profileSummary
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch candidate profile'
      } as CandidateProfileErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function buildProfileSections(candidate: any): CandidateProfileSection[] {
  const sections: CandidateProfileSection[] = [];

  // Basic Info Section
  if (candidate) {
    sections.push({
      id: 'basic_info',
      title: 'Basic Information',
      order: 1,
      data: {
        type: 'basic_info' as const,
        profile_image_url: candidate.profile_image_url,
        first_name: candidate.first_name || candidate.user?.first_name,
        last_name: candidate.last_name || candidate.user?.last_name,
        title: candidate.title,
        current_position: candidate.current_position,
        industry: candidate.industry,
        location: candidate.location,
        country: candidate.country,
        city: candidate.city,
        address: candidate.address || candidate.user?.address,
        phone1: candidate.phone1 || candidate.user?.phone1,
        phone2: candidate.phone2 || candidate.user?.phone2,
        personal_website: candidate.personal_website,
        linkedin_url: candidate.linkedin_url,
        github_url: candidate.github_url,
        bio: candidate.bio,
        professional_summary: candidate.professional_summary,
        availability_status: candidate.availability_status,
        availability_date: candidate.availability_date,
        experience_level: candidate.experience_level,
        years_of_experience: candidate.years_of_experience,
        total_years_experience: candidate.total_years_experience,
        remote_preference: candidate.remote_preference,
        open_to_relocation: candidate.open_to_relocation,
        willing_to_travel: candidate.willing_to_travel,
        work_authorization: candidate.work_authorization,
        notice_period: candidate.notice_period,
        work_availability: candidate.work_availability,
        interview_ready: candidate.interview_ready,
        pre_qualified: candidate.pre_qualified,
        profile_completion_percentage: candidate.profile_completion_percentage,
        completedProfile: candidate.completedProfile,
        isApproved: candidate.isApproved
      }
    });

    // About Section
    sections.push({
      id: 'about',
      title: 'About',
      order: 2,
      data: {
        type: 'about',
        about: candidate.about,
        gender: candidate.gender,
        date_of_birth: candidate.date_of_birth,
        pronouns: candidate.pronouns,
        disability_status: candidate.disability_status,
        veteran_status: candidate.veteran_status,
        security_clearance: candidate.security_clearance,
        visa_assistance_needed: candidate.visa_assistance_needed,
        salary_visibility: candidate.salary_visibility,
        expected_salary_min: candidate.expected_salary_min,
        expected_salary_max: candidate.expected_salary_max,
        currency: candidate.currency
      }
    });

    // Experience Section
    if (candidate.work_experiences && candidate.work_experiences.length > 0) {
      sections.push({
        id: 'experience',
        title: 'Work Experience',
        order: 3,
        data: {
          type: 'experience',
          experiences: candidate.work_experiences.map((exp: Record<string, unknown>) => ({
            id: exp.id as string,
            title: exp.title as string,
            company: exp.company as string,
            employment_type: exp.employment_type as 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | null,
            is_current: exp.is_current as boolean,
            start_date: exp.start_date as Date,
            end_date: exp.end_date as Date | null,
            location: exp.location as string | null,
            description: exp.description as string | null,
            media_url: exp.media_url as string | null,
            skill_ids: exp.skill_ids as string[],
            accomplishments: (exp.accomplishments as Record<string, unknown>[]).map((acc: Record<string, unknown>) => ({
              id: acc.id as string,
              title: acc.title as string,
              description: acc.description as string,
              created_at: acc.created_at as Date
            }))
          }))
        }
      });
    }

    // Education Section
    if (candidate.educations && candidate.educations.length > 0) {
      sections.push({
        id: 'education',
        title: 'Education',
        order: 4,
        data: {
          type: 'education',
          educations: candidate.educations.map((edu: Record<string, unknown>) => ({
            id: edu.id as string,
            degree_diploma: edu.degree_diploma as string,
            university_school: edu.university_school as string,
            field_of_study: edu.field_of_study as string | null,
            description: edu.description as string | null,
            start_date: edu.start_date as Date,
            end_date: edu.end_date as Date | null,
            grade: edu.grade as string | null,
            activities_societies: edu.activities_societies as string | null,
            skill_ids: edu.skill_ids as string[],
            media_url: edu.media_url as string | null
          }))
        }
      });
    }

    // Skills Section
    if (candidate.skills && candidate.skills.length > 0) {
      sections.push({
        id: 'skills',
        title: 'Skills',
        order: 5,
        data: {
          type: 'skills',
          skills: candidate.skills.map((skill: Record<string, unknown>) => ({
            id: skill.id as string,
            name: (skill.skill as Record<string, unknown>).name as string,
            category: (skill.skill as Record<string, unknown>).category as string | null,
            description: (skill.skill as Record<string, unknown>).description as string | null,
            proficiency: skill.proficiency as number | null,
            years_of_experience: skill.years_of_experience as number | null,
            skill_source: skill.skill_source as string | null,
            source_title: skill.source_title as string | null,
            source_company: skill.source_company as string | null,
            source_institution: skill.source_institution as string | null,
            source_authority: skill.source_authority as string | null,
            source_type: skill.source_type as string | null
          }))
        }
      });
    }

    // Projects Section
    if (candidate.projects && candidate.projects.length > 0) {
      sections.push({
        id: 'projects',
        title: 'Projects',
        order: 6,
        data: {
          type: 'projects',
          projects: candidate.projects.map((project: Record<string, unknown>) => ({
            id: project.id as string,
            name: project.name as string,
            description: project.description as string | null,
            start_date: project.start_date as Date | null,
            end_date: project.end_date as Date | null,
            is_current: project.is_current as boolean,
            role: project.role as string | null,
            responsibilities: project.responsibilities as string | null,
            technologies: project.technologies as string[],
            tools: project.tools as string[],
            methodologies: project.methodologies as string[],
            is_confidential: project.is_confidential as boolean,
            can_share_details: project.can_share_details as boolean,
            url: project.url as string | null,
            repository_url: project.repository_url as string | null,
            media_urls: project.media_urls as string[],
            skills_gained: project.skills_gained as string[]
          }))
        }
      });
    }

    // Certificates Section
    if (candidate.certificates && candidate.certificates.length > 0) {
      sections.push({
        id: 'certificates',
        title: 'Certifications',
        order: 7,
        data: {
          type: 'certificates',
          certificates: candidate.certificates.map((cert: Record<string, unknown>) => ({
            id: cert.id as string,
            name: cert.name as string,
            issuing_authority: cert.issuing_authority as string,
            issue_date: cert.issue_date as Date | null,
            expiry_date: cert.expiry_date as Date | null,
            credential_id: cert.credential_id as string | null,
            credential_url: cert.credential_url as string | null,
            description: cert.description as string | null,
            skill_ids: cert.skill_ids as string[],
            media_url: cert.media_url as string | null
          }))
        }
      });
    }

    // Languages Section
    if (candidate.languages && candidate.languages.length > 0) {
      sections.push({
        id: 'languages',
        title: 'Languages',
        order: 8,
        data: {
          type: 'languages',
          languages: candidate.languages.map((lang: Record<string, unknown>) => ({
            id: lang.id as string,
            language: lang.language as string,
            is_native: lang.is_native as boolean,
            oral_proficiency: lang.oral_proficiency as string | null,
            written_proficiency: lang.written_proficiency as string | null
          }))
        }
      });
    }

    // Awards Section
    if (candidate.awards && candidate.awards.length > 0) {
      sections.push({
        id: 'awards',
        title: 'Awards & Recognition',
        order: 9,
        data: {
          type: 'awards',
          awards: candidate.awards.map((award: Record<string, unknown>) => ({
            id: award.id as string,
            title: award.title as string,
            associated_with: award.associated_with as string | null,
            offered_by: award.offered_by as string,
            date: award.date as Date | null,
            description: award.description as string | null,
            media_url: award.media_url as string | null,
            skill_ids: award.skill_ids as string[]
          }))
        }
      });
    }

    // Volunteering Section
    if (candidate.volunteering && candidate.volunteering.length > 0) {
      sections.push({
        id: 'volunteering',
        title: 'Volunteering',
        order: 10,
        data: {
          type: 'volunteering',
          volunteering: candidate.volunteering.map((vol: Record<string, unknown>) => ({
            id: vol.id as string,
            role: vol.role as string,
            institution: vol.institution as string,
            cause: vol.cause as string | null,
            start_date: vol.start_date as Date | null,
            end_date: vol.end_date as Date | null,
            is_current: vol.is_current as boolean,
            description: vol.description as string | null,
            media_url: vol.media_url as string | null
          }))
        }
      });
    }

    // Accomplishments Section
    if (candidate.accomplishments && candidate.accomplishments.length > 0) {
      sections.push({
        id: 'accomplishments',
        title: 'Accomplishments',
        order: 11,
        data: {
          type: 'accomplishments',
          accomplishments: candidate.accomplishments.map((acc: Record<string, unknown>) => ({
            id: acc.id as string,
            title: acc.title as string,
            description: acc.description as string | null,
            created_at: acc.created_at as Date
          }))
        }
      });
    }
  }

  return sections;
}

function calculateProfileSummary(candidate: Record<string, unknown>) {
  const totalExperienceYears = (candidate.total_years_experience as number) || (candidate.years_of_experience as number) || 0;
  const totalProjects = (candidate.projects as unknown[])?.length || 0;
  const totalCertificates = (candidate.certificates as unknown[])?.length || 0;
  const totalSkills = (candidate.skills as unknown[])?.length || 0;
  const profileCompletionPercentage = (candidate.profile_completion_percentage as number) || 0;
  const isApproved = (candidate.isApproved as boolean) || false;

  return {
    total_experience_years: totalExperienceYears,
    total_projects: totalProjects,
    total_certificates: totalCertificates,
    total_skills: totalSkills,
    profile_completion_percentage: profileCompletionPercentage,
    is_approved: isApproved
  };
}

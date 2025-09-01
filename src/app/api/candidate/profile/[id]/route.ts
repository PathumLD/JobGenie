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
          experiences: candidate.work_experiences.map((exp: any) => ({
            id: exp.id,
            title: exp.title,
            company: exp.company,
            employment_type: exp.employment_type,
            is_current: exp.is_current,
            start_date: exp.start_date,
            end_date: exp.end_date,
            location: exp.location,
            description: exp.description,
            media_url: exp.media_url,
            skill_ids: exp.skill_ids,
            accomplishments: exp.accomplishments.map((acc: any) => ({
              id: acc.id,
              title: acc.title,
              description: acc.description,
              created_at: acc.created_at
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
          educations: candidate.educations.map((edu: any) => ({
            id: edu.id,
            degree_diploma: edu.degree_diploma,
            university_school: edu.university_school,
            field_of_study: edu.field_of_study,
            description: edu.description,
            start_date: edu.start_date,
            end_date: edu.end_date,
            grade: edu.grade,
            activities_societies: edu.activities_societies,
            skill_ids: edu.skill_ids,
            media_url: edu.media_url
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
          skills: candidate.skills.map((skill: any) => ({
            id: skill.id,
            name: skill.skill.name,
            category: skill.skill.category,
            description: skill.skill.description,
            proficiency: skill.proficiency,
            years_of_experience: skill.years_of_experience,
            skill_source: skill.skill_source,
            source_title: skill.source_title,
            source_company: skill.source_company,
            source_institution: skill.source_institution,
            source_authority: skill.source_authority,
            source_type: skill.source_type
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
          projects: candidate.projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            start_date: project.start_date,
            end_date: project.end_date,
            is_current: project.is_current,
            role: project.role,
            responsibilities: project.responsibilities,
            technologies: project.technologies,
            tools: project.tools,
            methodologies: project.methodologies,
            is_confidential: project.is_confidential,
            can_share_details: project.can_share_details,
            url: project.url,
            repository_url: project.repository_url,
            media_urls: project.media_urls,
            skills_gained: project.skills_gained
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
          certificates: candidate.certificates.map((cert: any) => ({
            id: cert.id,
            name: cert.name,
            issuing_authority: cert.issuing_authority,
            issue_date: cert.issue_date,
            expiry_date: cert.expiry_date,
            credential_id: cert.credential_id,
            credential_url: cert.credential_url,
            description: cert.description,
            skill_ids: cert.skill_ids,
            media_url: cert.media_url
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
          languages: candidate.languages.map((lang: any) => ({
            id: lang.id,
            language: lang.language,
            is_native: lang.is_native,
            oral_proficiency: lang.oral_proficiency,
            written_proficiency: lang.written_proficiency
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
          awards: candidate.awards.map((award: any) => ({
            id: award.id,
            title: award.title,
            associated_with: award.associated_with,
            offered_by: award.offered_by,
            date: award.date,
            description: award.description,
            media_url: award.media_url,
            skill_ids: award.skill_ids
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
          volunteering: candidate.volunteering.map((vol: any) => ({
            id: vol.id,
            role: vol.role,
            institution: vol.institution,
            cause: vol.cause,
            start_date: vol.start_date,
            end_date: vol.end_date,
            is_current: vol.is_current,
            description: vol.description,
            media_url: vol.media_url
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
          accomplishments: candidate.accomplishments.map((acc: any) => ({
            id: acc.id,
            title: acc.title,
            description: acc.description,
            created_at: acc.created_at
          }))
        }
      });
    }
  }

  return sections;
}

function calculateProfileSummary(candidate: any) {
  const totalExperienceYears = candidate.total_years_experience || candidate.years_of_experience || 0;
  const totalProjects = candidate.projects?.length || 0;
  const totalCertificates = candidate.certificates?.length || 0;
  const totalSkills = candidate.skills?.length || 0;
  const profileCompletionPercentage = candidate.profile_completion_percentage || 0;
  const isApproved = candidate.isApproved || false;

  return {
    total_experience_years: totalExperienceYears,
    total_projects: totalProjects,
    total_certificates: totalCertificates,
    total_skills: totalSkills,
    profile_completion_percentage: profileCompletionPercentage,
    is_approved: isApproved
  };
}

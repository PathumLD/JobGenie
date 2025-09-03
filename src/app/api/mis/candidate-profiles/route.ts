import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for query parameters
const querySchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format').optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).optional().default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional().default(10),
  search: z.string().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'principal']).optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional()
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    
    // If candidateId is provided, return specific candidate profile
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { user_id: candidateId },
        include: {
          user: {
            select: {
              email: true,
              status: true,
              created_at: true,
              updated_at: true
            }
          },
          work_experiences: {
            orderBy: { start_date: 'desc' }
          },
          educations: {
            orderBy: { start_date: 'desc' }
          },
          skills: {
            include: {
              skill: true
            }
          },
          certificates: {
            orderBy: { issue_date: 'desc' }
          },
          projects: {
            orderBy: { start_date: 'desc' }
          },
          languages: true,
          awards: {
            orderBy: { date: 'desc' }
          },
          volunteering: {
            orderBy: { start_date: 'desc' }
          },
          accomplishments: {
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!candidate) {
        return NextResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        );
      }

      // Transform data to match the expected format
      const profileData = {
        id: candidate.user_id,
        sections: [
          {
            id: 'basic_info',
            title: 'Basic Information',
            data: {
              type: 'basic_info',
              profile_image_url: candidate.profile_image_url,
              first_name: candidate.first_name,
              last_name: candidate.last_name,
              title: candidate.title,
              current_position: candidate.current_position,
              industry: candidate.industry,
              bio: candidate.bio,
              about: candidate.about,
              country: candidate.country,
              city: candidate.city,
              location: candidate.location,
              address: candidate.address,
              phone1: candidate.phone1,
              phone2: candidate.phone2,
              personal_website: candidate.personal_website,
              github_url: candidate.github_url,
              linkedin_url: candidate.linkedin_url,
              years_of_experience: candidate.years_of_experience,
              gender: candidate.gender,
              date_of_birth: candidate.date_of_birth,
              nic: candidate.nic,
              passport: candidate.passport,
              membership_no: candidate.membership_no,
              remote_preference: candidate.remote_preference,
              experience_level: candidate.experience_level,
              expected_salary_min: candidate.expected_salary_min,
              expected_salary_max: candidate.expected_salary_max,
              currency: candidate.currency,
              availability_status: candidate.availability_status,
              availability_date: candidate.availability_date,
              professional_summary: candidate.professional_summary,
              total_years_experience: candidate.total_years_experience,
              open_to_relocation: candidate.open_to_relocation,
              willing_to_travel: candidate.willing_to_travel,
              security_clearance: candidate.security_clearance,
              disability_status: candidate.disability_status,
              veteran_status: candidate.veteran_status,
              pronouns: candidate.pronouns,
              salary_visibility: candidate.salary_visibility,
              notice_period: candidate.notice_period,
              work_authorization: candidate.work_authorization,
              visa_assistance_needed: candidate.visa_assistance_needed,
              work_availability: candidate.work_availability,
              interview_ready: candidate.interview_ready,
              pre_qualified: candidate.pre_qualified,
              email: candidate.user.email
            },
            order: 1
          },
          {
            id: 'experience',
            title: 'Work Experience',
            data: {
              type: 'experience',
              experiences: candidate.work_experiences.map(exp => ({
                id: exp.id,
                title: exp.title,
                company: exp.company,
                employment_type: exp.employment_type,
                is_current: exp.is_current,
                start_date: exp.start_date,
                end_date: exp.end_date,
                location: exp.location,
                description: exp.description,
                skill_ids: exp.skill_ids,
                media_url: exp.media_url
              }))
            },
            order: 2
          },
          {
            id: 'education',
            title: 'Education',
            data: {
              type: 'education',
              educations: candidate.educations.map(edu => ({
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
            },
            order: 3
          },
          {
            id: 'skills',
            title: 'Skills',
            data: {
              type: 'skills',
              skills: candidate.skills.map(cs => ({
                id: cs.skill.id,
                name: cs.skill.name,
                category: cs.skill.category,
                description: cs.skill.description
              }))
            },
            order: 4
          },
          {
            id: 'projects',
            title: 'Projects',
            data: {
              type: 'projects',
              projects: candidate.projects.map(proj => ({
                id: proj.id,
                name: proj.name,
                description: proj.description,
                start_date: proj.start_date,
                end_date: proj.end_date,
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
                skills_gained: proj.skills_gained
              }))
            },
            order: 5
          },
          {
            id: 'certificates',
            title: 'Certificates',
            data: {
              type: 'certificates',
              certificates: candidate.certificates.map(cert => ({
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
            },
            order: 6
          },
          {
            id: 'languages',
            title: 'Languages',
            data: {
              type: 'languages',
              languages: candidate.languages.map(lang => ({
                id: lang.id,
                language: lang.language,
                is_native: lang.is_native,
                oral_proficiency: lang.oral_proficiency,
                written_proficiency: lang.written_proficiency
              }))
            },
            order: 7
          },
          {
            id: 'awards',
            title: 'Awards',
            data: {
              type: 'awards',
              awards: candidate.awards.map(award => ({
                id: award.id,
                title: award.title,
                offered_by: award.offered_by,
                associated_with: award.associated_with,
                date: award.date,
                description: award.description,
                media_url: award.media_url,
                skill_ids: award.skill_ids
              }))
            },
            order: 8
          },
          {
            id: 'volunteering',
            title: 'Volunteering',
            data: {
              type: 'volunteering',
              volunteering: candidate.volunteering.map(vol => ({
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
            },
            order: 9
          },
          {
            id: 'accomplishments',
            title: 'Accomplishments',
            data: {
              type: 'accomplishments',
              accomplishments: candidate.accomplishments.map(acc => ({
                id: acc.id,
                title: acc.title,
                description: acc.description,
                work_experience_id: acc.work_experience_id,
                resume_id: acc.resume_id,
                created_at: acc.created_at
              }))
            },
            order: 10
          }
        ]
      };

      return NextResponse.json({
        success: true,
        data: profileData
      });
    }

    // Parse and validate query parameters for listing
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryValidation.error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path
          }))
        },
        { status: 400 }
      );
    }

    const { page, limit, search, approvalStatus, experienceLevel, industry, country, city } = queryValidation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { current_position: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (approvalStatus) {
      whereClause.approval_status = approvalStatus;
    }

    if (experienceLevel) {
      whereClause.experience_level = experienceLevel;
    }

    if (industry) {
      whereClause.industry = industry;
    }

    if (country) {
      whereClause.country = country;
    }

    if (city) {
      whereClause.city = city;
    }

    // Get total count
    const totalCount = await prisma.candidate.count({
      where: whereClause
    });

    // Get candidates with pagination
    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        title: true,
        current_position: true,
        industry: true,
        location: true,
        experience_level: true,
        years_of_experience: true,
        approval_status: true,
        profile_completion_percentage: true,
        profile_image_url: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            email: true,
            status: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching candidate profiles:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

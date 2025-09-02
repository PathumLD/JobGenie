import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Response types
interface JobDetailResponse {
  message: string;
  job: {
    id: string;
    title: string;
    description: string;
    job_type: string;
    experience_level: string;
    location: string | null;
    remote_type: string;
    salary_min: number | null;
    salary_max: number | null;
    currency: string | null;
    salary_type: string | null;
    equity_offered: boolean;
    ai_skills_required: boolean;
    application_deadline: Date | null;
    status: string;
    published_at: Date | null;
    priority_level: number;
    views_count: number;
    applications_count: number;
    created_at: Date;
    updated_at: Date;
    
    // Company information
    company: {
      id: string;
      name: string;
      email: string;
      industry: string;
      company_size: string;
      company_type: string;
      headquarters_location: string | null;
      description: string | null;
      logo_url: string | null;
      website: string | null;
      benefits: string | null;
      culture_description: string | null;
      founded_year: number | null;
      social_media_links: unknown;
      verification_status: string;
    } | null;
    
    // Custom company information (for jobs posted by MIS users)
    customCompanyName: string | null;
    customCompanyEmail: string | null;
    customCompanyPhone: string | null;
    customCompanyWebsite: string | null;
    
    // Job designation
    jobDesignation: {
      id: number;
      name: string;
      isco_08: {
        id: number;
        description: string;
        major: number;
        major_label: string;
        sub_major: number;
        sub_major_label: string;
        minor: number;
        minor_label: string;
        unit: number;
      };
    };
    
    // Skills required
    skills: Array<{
      id: string;
      name: string;
      category: string | null;
      description: string | null;
      required_level: string;
      proficiency_level: string;
      years_required: number | null;
      weight: number;
    }>;
    
    // Creator information
    creator_type: string;
    creator_mis_user?: {
      user_id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
    } | null;
  };
  
  // Related jobs (similar jobs)
  related_jobs: Array<{
    id: string;
    title: string;
    company_name: string | null;
    customCompanyName: string | null;
    location: string | null;
    remote_type: string;
    salary_min: number | null;
    salary_max: number | null;
    currency: string | null;
    experience_level: string;
    job_type: string;
    created_at: Date;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<JobDetailResponse | ApiErrorResponse>> {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch job details with all related information
    const job = await prisma.job.findUnique({
      where: { 
        id: jobId,
        status: 'published' // Only show published jobs
      },
      include: {
        company: true,
        skills: {
          include: {
            skill: true
          }
        },
        jobDesignation: {
          include: {
            isco_08: true
          }
        },
        creator_mis_user: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or not published' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.job.update({
      where: { id: jobId },
      data: { views_count: { increment: 1 } }
    });

    // Transform job data
    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      job_type: job.job_type,
      experience_level: job.experience_level,
      location: job.location,
      remote_type: job.remote_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      currency: job.currency,
      salary_type: job.salary_type,
      equity_offered: job.equity_offered,
      ai_skills_required: job.ai_skills_required,
      application_deadline: job.application_deadline,
      status: job.status,
      published_at: job.published_at,
      priority_level: job.priority_level,
      views_count: job.views_count + 1, // Include the increment
      applications_count: job.applications_count,
      created_at: job.created_at,
      updated_at: job.updated_at,
      
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        email: job.company.email,
        industry: job.company.industry,
        company_size: job.company.company_size,
        company_type: job.company.company_type,
        headquarters_location: job.company.headquarters_location,
        description: job.company.description,
        logo_url: job.company.logo_url,
        website: job.company.website,
        benefits: job.company.benefits,
        culture_description: job.company.culture_description,
        founded_year: job.company.founded_year,
        social_media_links: job.company.social_media_links,
        verification_status: job.company.verification_status
      } : null,
      
      customCompanyName: job.customCompanyName,
      customCompanyEmail: job.customCompanyEmail,
      customCompanyPhone: job.customCompanyPhone,
      customCompanyWebsite: job.customCompanyWebsite,
      
      jobDesignation: {
        id: job.jobDesignation.id,
        name: job.jobDesignation.name,
        isco_08: {
          id: job.jobDesignation.isco_08.id,
          description: job.jobDesignation.isco_08.description,
          major: job.jobDesignation.isco_08.major,
          major_label: job.jobDesignation.isco_08.major_label,
          sub_major: job.jobDesignation.isco_08.sub_major,
          sub_major_label: job.jobDesignation.isco_08.sub_major_label,
          minor: job.jobDesignation.isco_08.minor,
          minor_label: job.jobDesignation.isco_08.minor_label,
          unit: job.jobDesignation.isco_08.unit
        }
      },
      
      skills: job.skills.map(jobSkill => ({
        id: jobSkill.skill.id,
        name: jobSkill.skill.name,
        category: jobSkill.skill.category,
        description: jobSkill.skill.description,
        required_level: jobSkill.required_level,
        proficiency_level: jobSkill.proficiency_level,
        years_required: jobSkill.years_required,
        weight: jobSkill.weight
      })),
      
      creator_type: job.creator_type,
      creator_mis_user: job.creator_mis_user
    };

    // Find related jobs (similar jobs based on skills, experience level, and job type)
    const relatedJobs = await prisma.job.findMany({
      where: {
        id: { not: jobId },
        status: 'published',
        OR: [
          { experience_level: job.experience_level },
          { job_type: job.job_type },
          {
            skills: {
              some: {
                skill: {
                  name: {
                    in: job.skills.map(s => s.skill.name)
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        company: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // Transform related jobs
    const transformedRelatedJobs = relatedJobs.map(relatedJob => ({
      id: relatedJob.id,
      title: relatedJob.title,
      company_name: relatedJob.company?.name || null,
      customCompanyName: relatedJob.customCompanyName,
      location: relatedJob.location,
      remote_type: relatedJob.remote_type,
      salary_min: relatedJob.salary_min,
      salary_max: relatedJob.salary_max,
      currency: relatedJob.currency,
      experience_level: relatedJob.experience_level,
      job_type: relatedJob.job_type,
      created_at: relatedJob.created_at
    }));

    const response: JobDetailResponse = {
      message: 'Job details retrieved successfully',
      job: transformedJob,
      related_jobs: transformedRelatedJobs
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Job detail error:', error);
    
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

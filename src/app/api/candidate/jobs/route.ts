import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Type for complex Prisma where clauses
type JobWhereClause = Prisma.JobWhereInput;

// Validation schema for job search and filtering
const jobSearchSchema = z.object({
  // Search parameters
  search: z.string().optional(),
  
  // Location filters
  location: z.string().optional(),
  remote_type: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  
  // Job type filters
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).optional(),
  
  // Experience level filters
  experience_level: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'principal']).optional(),
  
  // Salary filters
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  currency: z.string().optional(),
  
  // Industry filters
  industry: z.string().optional(),
  
  // Company filters
  company_size: z.enum(['startup', 'one_to_ten', 'eleven_to_fifty', 'fifty_one_to_two_hundred', 'two_hundred_one_to_five_hundred', 'five_hundred_one_to_one_thousand', 'one_thousand_plus']).optional(),
  
  // Date filters
  posted_after: z.string().datetime().optional(), // ISO date string
  posted_before: z.string().datetime().optional(), // ISO date string
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Sorting
  sort_by: z.enum(['created_at', 'published_at', 'salary_min', 'salary_max', 'views_count', 'applications_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Response types
interface JobListingResponse {
  message: string;
  jobs: Array<{
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
      industry: string;
      company_size: string;
      company_type: string;
      headquarters_location: string | null;
      logo_url: string | null;
      website: string | null;
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
    };
    
    // Skills required
    skills: Array<{
      id: string;
      name: string;
      category: string | null;
      required_level: string;
      proficiency_level: string;
      years_required: number | null;
      weight: number;
    }>;
  }>;
  
  // Pagination information
  pagination: {
    current_page: number;
    total_pages: number;
    total_jobs: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
  
  // Filter summary
  filters: {
    applied_filters: Record<string, unknown>;
    available_filters: {
      experience_levels: string[];
      job_types: string[];
      remote_types: string[];
      industries: string[];
      company_sizes: string[];
      salary_ranges: Array<{
        min: number;
        max: number;
        currency: string;
      }>;
    };
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<JobListingResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      search: searchParams.get('search') || undefined,
      location: searchParams.get('location') || undefined,
      remote_type: searchParams.get('remote_type') || undefined,
      job_type: searchParams.get('job_type') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      salary_min: searchParams.get('salary_min') ? Number(searchParams.get('salary_min')) : undefined,
      salary_max: searchParams.get('salary_max') ? Number(searchParams.get('salary_max')) : undefined,
      currency: searchParams.get('currency') || undefined,
      industry: searchParams.get('industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      posted_after: searchParams.get('posted_after') || undefined,
      posted_before: searchParams.get('posted_before') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc'
    };

    // Validate query parameters
    const validationResult = jobSearchSchema.safeParse(queryParams);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map(issue => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.map(p => typeof p === 'string' ? p : String(p))
      }));
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errorDetails 
        }, 
        { status: 400 }
      );
    }

    const {
      search,
      location,
      remote_type,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      currency,
      industry,
      company_size,
      posted_after,
      posted_before,
      page,
      limit,
      sort_by,
      sort_order
    } = validationResult.data;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for job filtering
    const whereClause: Record<string, unknown> = {
      status: 'published', // Only show published jobs
      OR: [
        // Jobs posted by employers (with company)
        {
          creator_type: 'employer',
          company: company_size ? { company_size } : undefined,
          industry: industry ? { industry } : undefined
        },
        // Jobs posted by MIS users (custom company info)
        {
          creator_type: 'mis_user'
        }
      ]
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          company: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        },
        { customCompanyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add location filter
    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    // Add remote type filter
    if (remote_type) {
      whereClause.remote_type = remote_type;
    }

    // Add job type filter
    if (job_type) {
      whereClause.job_type = job_type;
    }

    // Add experience level filter
    if (experience_level) {
      whereClause.experience_level = experience_level;
    }

    // Add salary filters
    if (salary_min !== undefined || salary_max !== undefined) {
      const salaryFilter: Record<string, unknown> = {};
      if (salary_min !== undefined) {
        salaryFilter.salary_min = { gte: salary_min };
      }
      if (salary_max !== undefined) {
        salaryFilter.salary_max = { lte: salary_max };
      }
      if (currency) {
        salaryFilter.currency = currency;
      }
      
      whereClause.AND = [salaryFilter];
    }

    // Add date filters
    if (posted_after || posted_before) {
      whereClause.created_at = {};
      if (posted_after) {
        (whereClause.created_at as Record<string, unknown>).gte = new Date(posted_after);
      }
      if (posted_before) {
        (whereClause.created_at as Record<string, unknown>).lte = new Date(posted_before);
      }
    }

    // Build order by clause
    const orderBy: Record<string, string> = {};
    orderBy[sort_by] = sort_order;

    // Fetch jobs with pagination
    const [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where: whereClause as any, // Type assertion needed for complex Prisma queries
        include: {
          company: true,
          skills: {
            include: {
              skill: true
            }
          },
          jobDesignation: true
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.job.count({ where: whereClause as any })
    ]);

    // Transform jobs data
    const transformedJobs = jobs.map(job => ({
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
      views_count: job.views_count,
      applications_count: job.applications_count,
      created_at: job.created_at,
      updated_at: job.updated_at,
      
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        industry: job.company.industry,
        company_size: job.company.company_size,
        company_type: job.company.company_type,
        headquarters_location: job.company.headquarters_location,
        logo_url: job.company.logo_url,
        website: job.company.website
      } : null,
      
      customCompanyName: job.customCompanyName,
      customCompanyEmail: job.customCompanyEmail,
      customCompanyPhone: job.customCompanyPhone,
      customCompanyWebsite: job.customCompanyWebsite,
      
      jobDesignation: {
        id: job.jobDesignation.id,
        name: job.jobDesignation.name
      },
      
      skills: job.skills.map(jobSkill => ({
        id: jobSkill.skill.id,
        name: jobSkill.skill.name,
        category: jobSkill.skill.category,
        required_level: jobSkill.required_level,
        proficiency_level: jobSkill.proficiency_level,
        years_required: jobSkill.years_required,
        weight: jobSkill.weight
      }))
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalJobs / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Get available filters for the current result set
    const availableFilters = await getAvailableFilters(whereClause);

    const response: JobListingResponse = {
      message: 'Jobs retrieved successfully',
      jobs: transformedJobs,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_jobs: totalJobs,
        has_next: hasNext,
        has_previous: hasPrevious,
        next_page: hasNext ? page + 1 : null,
        previous_page: hasPrevious ? page - 1 : null
      },
      filters: {
        applied_filters: {
          search,
          location,
          remote_type,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          currency,
          industry,
          company_size,
          posted_after,
          posted_before
        },
        available_filters: availableFilters
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Job listing error:', error);
    
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

// Helper function to get available filters
async function getAvailableFilters(baseWhereClause: Record<string, unknown>) {
  try {
    const [
      experienceLevels,
      jobTypes,
      remoteTypes,
      industries,
      companySizes,
      salaryRanges
    ] = await Promise.all([
      // Get available experience levels
      prisma.job.findMany({
        where: { ...baseWhereClause, status: 'published' } as any,
        select: { experience_level: true },
        distinct: ['experience_level']
      }),
      
      // Get available job types
      prisma.job.findMany({
        where: { ...baseWhereClause, status: 'published' } as any,
        select: { job_type: true },
        distinct: ['job_type']
      }),
      
      // Get available remote types
      prisma.job.findMany({
        where: { ...baseWhereClause, status: 'published' } as any,
        select: { remote_type: true },
        distinct: ['remote_type']
      }),
      
      // Get available industries
      prisma.job.findMany({
        where: { 
          ...baseWhereClause, 
          status: 'published',
          company: { industry: { not: null } }
        } as any,
        select: {
          company: { select: { industry: true } }
        }
      }),
      
      // Get available company sizes
      prisma.job.findMany({
        where: { 
          ...baseWhereClause, 
          status: 'published',
          company: { company_size: { not: null } }
        } as any,
        select: {
          company: { select: { company_size: true } }
        }
      }),
      
      // Get salary ranges
      prisma.job.findMany({
        where: { 
          ...baseWhereClause, 
          status: 'published',
          OR: [
            { salary_min: { not: null } },
            { salary_max: { not: null } }
          ]
        } as any,
        select: { 
          salary_min: true, 
          salary_max: true, 
          currency: true 
        }
      })
    ]);

    return {
      experience_levels: experienceLevels.map(job => job.experience_level),
      job_types: jobTypes.map(job => job.job_type),
      remote_types: remoteTypes.map(job => job.remote_type),
      industries: industries
        .map(job => job.company?.industry)
        .filter(Boolean) as string[],
      company_sizes: companySizes
        .map(job => job.company?.company_size)
        .filter(Boolean) as string[],
      salary_ranges: salaryRanges
        .filter(job => job.salary_min || job.salary_max)
        .map(job => ({
          min: job.salary_min || 0,
          max: job.salary_max || 0,
          currency: job.currency || 'LKR'
        }))
    };
  } catch (error) {
    console.error('Error getting available filters:', error);
    return {
      experience_levels: [],
      job_types: [],
      remote_types: [],
      industries: [],
      company_sizes: [],
      salary_ranges: []
    };
  }
}


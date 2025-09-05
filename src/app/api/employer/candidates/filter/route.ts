import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';
import type { ApiErrorResponse } from '@/types/api';

const prisma = new PrismaClient();

// Validation schema for candidate filtering
const candidateFilterSchema = z.object({
  // Field (ISCO_08 unit)
  field: z.number().optional(),
  
  // Designation - now mandatory
  designation: z.number().min(1, 'Designation is required'),
  
  // Expected salary range
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  
  // Years of experience
  years_of_experience: z.number().min(0).optional(),
  
  // Qualification (from education)
  qualification: z.string().optional(),
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Sorting
  sort_by: z.enum(['created_at', 'years_of_experience', 'expected_salary_min', 'expected_salary_max']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Response types
interface FilteredCandidate {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  current_position: string | null;
  industry: string | null;
  years_of_experience: number | null;
  total_years_experience: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  currency: string | null;
  experience_level: string | null;
  availability_status: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  profile_image_url: string | null;
  professional_summary: string | null;
  professional_qualification: string | null;
  created_at: Date | null;
  date_of_birth: Date | null;
  // Education data for qualification matching
  educations: Array<{
    degree_diploma: string | null;
    field_of_study: string | null;
    university_school: string | null;
  }>;
  // Skills for additional matching
  skills: Array<{
    name: string;
    proficiency: number | null;
  }>;
  // Work experiences for employer-wise display
  work_experiences: Array<{
    title: string | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
  }>;
}

interface CandidateFilterResponse {
  success: boolean;
  candidates: FilteredCandidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  message: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<CandidateFilterResponse | ApiErrorResponse>> {
  try {
    // Verify JWT token
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token required'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid authentication token'
        } as ApiErrorResponse,
        { status: 401 }
      );
    }

    // Check if user is an employer
    if (decodedToken.role !== 'employer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Only employers can access this endpoint.'
        } as ApiErrorResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      field: searchParams.get('field') ? Number(searchParams.get('field')) : undefined,
      designation: searchParams.get('designation') ? Number(searchParams.get('designation')) : undefined,
      salary_min: searchParams.get('salary_min') ? Number(searchParams.get('salary_min')) : undefined,
      salary_max: searchParams.get('salary_max') ? Number(searchParams.get('salary_max')) : undefined,
      years_of_experience: searchParams.get('years_of_experience') ? Number(searchParams.get('years_of_experience')) : undefined,
      qualification: searchParams.get('qualification') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc'
    };

    // Check if designation is provided
    if (!queryParams.designation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Designation is required to filter candidates'
        }, 
        { status: 400 }
      );
    }

    // Validate query parameters
    const validationResult = candidateFilterSchema.safeParse(queryParams);
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
      field,
      designation,
      salary_min,
      salary_max,
      years_of_experience,
      qualification,
      page,
      limit,
      sort_by,
      sort_order
    } = validationResult.data;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for candidate filtering
    const whereClause: any = {
      approval_status: 'approved', // Only show approved candidates
      user: {
        role: 'candidate',
        status: 'active'
      }
    };

    // Add field filter (ISCO_08 unit)
    if (field) {
      // Get ISCO_08 unit description to filter by industry or current position
      const iscoUnit = await prisma.iSCO08.findFirst({
        where: { unit: field },
        select: { description: true, major_label: true }
      });
      
      if (iscoUnit) {
        // Filter by industry or current position containing the unit description or major label
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push({
          OR: [
            { industry: { contains: iscoUnit.description, mode: 'insensitive' } },
            { industry: { contains: iscoUnit.major_label, mode: 'insensitive' } },
            { current_position: { contains: iscoUnit.description, mode: 'insensitive' } },
            { title: { contains: iscoUnit.description, mode: 'insensitive' } }
          ]
        });
      }
    }

    // Add designation filter - this is now mandatory
    const jobDesignation = await prisma.jobDesignation.findFirst({
      where: { id: designation },
      select: { name: true }
    });
    
    if (jobDesignation) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        OR: [
          { current_position: { contains: jobDesignation.name, mode: 'insensitive' } },
          { title: { contains: jobDesignation.name, mode: 'insensitive' } }
        ]
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid designation selected'
        }, 
        { status: 400 }
      );
    }

    // Add salary range filter
    if (salary_min !== undefined || salary_max !== undefined) {
      whereClause.AND = whereClause.AND || [];
      
      if (salary_min !== undefined) {
        whereClause.AND.push({
          OR: [
            { expected_salary_min: { gte: salary_min } },
            { expected_salary_max: { gte: salary_min } }
          ]
        });
      }
      
      if (salary_max !== undefined) {
        whereClause.AND.push({
          OR: [
            { expected_salary_min: { lte: salary_max } },
            { expected_salary_max: { lte: salary_max } }
          ]
        });
      }
    }

    // Add years of experience filter
    if (years_of_experience !== undefined) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        OR: [
          { years_of_experience: { gte: years_of_experience } },
          { total_years_experience: { gte: years_of_experience } }
        ]
      });
    }

    // Add qualification filter (from professional_qualification field)
    if (qualification) {
      whereClause.professional_qualification = qualification;
    }


    // Build order by clause
    const orderBy: any = {};
    if (sort_by === 'years_of_experience') {
      orderBy.years_of_experience = sort_order;
    } else if (sort_by === 'expected_salary_min') {
      orderBy.expected_salary_min = sort_order;
    } else if (sort_by === 'expected_salary_max') {
      orderBy.expected_salary_max = sort_order;
    } else {
      orderBy.created_at = sort_order;
    }

    // Fetch candidates with pagination
    const [candidates, total] = await Promise.all([
      (prisma.candidate as any).findMany({
        where: whereClause,
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          title: true,
          current_position: true,
          industry: true,
          years_of_experience: true,
          total_years_experience: true,
          expected_salary_min: true,
          expected_salary_max: true,
          currency: true,
          experience_level: true,
          availability_status: true,
          country: true,
          city: true,
          location: true,
          profile_image_url: true,
          professional_summary: true,
          professional_qualification: true,
          created_at: true,
          date_of_birth: true,
          educations: {
            select: {
              degree_diploma: true,
              field_of_study: true,
              university_school: true
            }
          },
          skills: {
            select: {
              skill: {
                select: {
                  name: true
                }
              },
              proficiency: true
            }
          },
          work_experiences: {
            select: {
              title: true,
              company: true,
              start_date: true,
              end_date: true,
              is_current: true
            },
            orderBy: {
              start_date: 'desc'
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.candidate.count({
        where: whereClause
      })
    ]);

    // Transform skills data
    const transformedCandidates = candidates.map((candidate: any) => ({
      ...candidate,
      skills: candidate.skills.map((skill: any) => ({
        name: skill.skill.name,
        proficiency: skill.proficiency
      }))
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      candidates: transformedCandidates,
      total,
      page,
      limit,
      total_pages: totalPages,
      message: `Found ${total} candidates matching your criteria`
    });

  } catch (error) {
    console.error('Error filtering candidates:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to filter candidates'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

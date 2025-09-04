import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

interface SavedCandidate {
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
  created_at: Date | null;
  date_of_birth: Date | null;
  educations: Array<{
    degree_diploma: string | null;
    field_of_study: string | null;
    university_school: string | null;
  }>;
  skills: Array<{
    name: string;
    proficiency: number | null;
  }>;
  work_experiences: Array<{
    title: string | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
  }>;
}

interface SavedCandidatesResponse {
  success: boolean;
  candidates: SavedCandidate[];
  total: number;
  message: string;
}

interface SavedCandidatesErrorResponse {
  success: false;
  error: string;
  message: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<SavedCandidatesResponse | SavedCandidatesErrorResponse>> {
  try {
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as SavedCandidatesErrorResponse,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as SavedCandidatesErrorResponse,
        { status: 401 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch candidates where interview_ready is true
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where: {
          interview_ready: true
        },
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
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.candidate.count({
        where: {
          interview_ready: true
        }
      })
    ]);

    // Transform skills data
    const transformedCandidates = candidates.map(candidate => ({
      ...candidate,
      skills: candidate.skills.map(skill => ({
        name: skill.skill.name,
        proficiency: skill.proficiency
      }))
    }));

    return NextResponse.json({
      success: true,
      candidates: transformedCandidates,
      total,
      message: `Found ${total} saved candidates`
    } as SavedCandidatesResponse);

  } catch (error) {
    console.error('Error fetching saved candidates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch saved candidates'
      } as SavedCandidatesErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

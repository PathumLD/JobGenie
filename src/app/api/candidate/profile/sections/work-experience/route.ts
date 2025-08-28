import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EmploymentType } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface WorkExperienceData {
  id?: string;
  title?: string;
  employment_type?: EmploymentType;
  is_current?: boolean;
  company?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface WorkExperienceResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    title: string | null;
    employment_type: EmploymentType | null;
    is_current: boolean | null;
    company: string | null;
    start_date: Date | null;
    end_date: Date | null;
    location: string | null;
    description: string | null;
    skill_ids: string[];
    media_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface WorkExperienceErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all work experiences for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<WorkExperienceResponse | WorkExperienceErrorResponse>> {
  try {
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as WorkExperienceErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as WorkExperienceErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const workExperiences = await prisma.workExperience.findMany({
      where: { candidate_id: userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Work experiences retrieved successfully',
      data: workExperiences
    });

  } catch (error) {
    console.error('Error fetching work experiences:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch work experiences'
      } as WorkExperienceErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new work experience
export async function POST(
  request: NextRequest
): Promise<NextResponse<WorkExperienceResponse | WorkExperienceErrorResponse>> {
  try {
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as WorkExperienceErrorResponse,
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
        } as WorkExperienceErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: WorkExperienceData = await request.json();

    // Validate required fields
    if (!body.title || !body.company || !body.start_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Title, company, and start date are required'
        } as WorkExperienceErrorResponse,
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(body.start_date);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid start date format'
        } as WorkExperienceErrorResponse,
        { status: 400 }
      );
    }

    let endDate: Date | null = null;
    if (body.end_date) {
      endDate = new Date(body.end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid end date format'
          } as WorkExperienceErrorResponse,
          { status: 400 }
        );
      }
    }

    // If setting as current, unset other current experiences
    if (body.is_current) {
      await prisma.workExperience.updateMany({
        where: { 
          candidate_id: userId,
          is_current: true 
        },
        data: { is_current: false }
      });
    }

    const workExperience = await prisma.workExperience.create({
      data: {
        candidate_id: userId,
        title: body.title,
        employment_type: body.employment_type,
        is_current: body.is_current || false,
        company: body.company,
        start_date: startDate,
        end_date: endDate,
        location: body.location,
        description: body.description,
        skill_ids: body.skill_ids || [],
        media_url: body.media_url
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Work experience created successfully',
      data: [workExperience]
    });

  } catch (error) {
    console.error('Error creating work experience:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create work experience'
      } as WorkExperienceErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

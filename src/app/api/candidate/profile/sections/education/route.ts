import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface EducationData {
  id?: string;
  degree_diploma?: string;
  university_school?: string;
  field_of_study?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  activities_societies?: string;
  skill_ids?: string[];
  media_url?: string;
}

interface EducationResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    degree_diploma: string | null;
    university_school: string | null;
    field_of_study: string | null;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    grade: string | null;
    activities_societies: string | null;
    skill_ids: string[];
    media_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface EducationErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all education records for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<EducationResponse | EducationErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as EducationErrorResponse,
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
        } as EducationErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const educations = await prisma.education.findMany({
      where: { candidate_id: userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Education records retrieved successfully',
      data: educations
    });

  } catch (error) {
    console.error('Error fetching education records:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch education records'
      } as EducationErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new education record
export async function POST(
  request: NextRequest
): Promise<NextResponse<EducationResponse | EducationErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as EducationErrorResponse,
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
        } as EducationErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: EducationData = await request.json();

    // Validate required fields
    if (!body.degree_diploma || !body.university_school || !body.start_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Degree/diploma, university/school, and start date are required'
        } as EducationErrorResponse,
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
        } as EducationErrorResponse,
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
          } as EducationErrorResponse,
          { status: 400 }
        );
      }
    }

    const education = await prisma.education.create({
      data: {
        candidate_id: userId,
        degree_diploma: body.degree_diploma,
        university_school: body.university_school,
        field_of_study: body.field_of_study,
        description: body.description,
        start_date: startDate,
        end_date: endDate,
        grade: body.grade,
        activities_societies: body.activities_societies,
        skill_ids: body.skill_ids || [],
        media_url: body.media_url
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Education record created successfully',
      data: [education]
    });

  } catch (error) {
    console.error('Error creating education record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create education record'
      } as EducationErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface VolunteeringData {
  id?: string;
  role?: string;
  institution?: string;
  cause?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  media_url?: string;
}

interface VolunteeringResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    candidate_id: string;
    role: string | null;
    institution: string | null;
    cause: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
    description: string | null;
    media_url: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface VolunteeringErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all volunteering records for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<VolunteeringResponse | VolunteeringErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const volunteering = await prisma.volunteering.findMany({
      where: { candidate_id: userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteering records retrieved successfully',
      data: volunteering
    });

  } catch (error) {
    console.error('Error fetching volunteering records:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch volunteering records'
      } as VolunteeringErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new volunteering record
export async function POST(
  request: NextRequest
): Promise<NextResponse<VolunteeringResponse | VolunteeringErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: VolunteeringData = await request.json();

    // Validate required fields
    if (!body.role || !body.institution || !body.start_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Role, institution, and start date are required'
        } as VolunteeringErrorResponse,
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
        } as VolunteeringErrorResponse,
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
          } as VolunteeringErrorResponse,
          { status: 400 }
        );
      }
    }

    const volunteering = await prisma.volunteering.create({
      data: {
        candidate_id: userId,
        role: body.role,
        institution: body.institution,
        cause: body.cause,
        start_date: startDate,
        end_date: endDate,
        is_current: body.is_current || false,
        description: body.description,
        media_url: body.media_url
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Volunteering record created successfully',
      data: [volunteering]
    });

  } catch (error) {
    console.error('Error creating volunteering record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create volunteering record'
      } as VolunteeringErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

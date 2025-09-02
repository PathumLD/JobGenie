import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface AccomplishmentData {
  id?: string;
  title?: string;
  description?: string;
  work_experience_id?: string;
  resume_id?: string;
}

interface AccomplishmentResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    candidate_id: string;
    work_experience_id: string | null;
    resume_id: string | null;
    title: string | null;
    description: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface AccomplishmentErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all accomplishments for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<AccomplishmentResponse | AccomplishmentErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as AccomplishmentErrorResponse,
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
        } as AccomplishmentErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const accomplishments = await prisma.accomplishment.findMany({
      where: { candidate_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Accomplishments retrieved successfully',
      data: accomplishments
    });

  } catch (error) {
    console.error('Error fetching accomplishments:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch accomplishments'
      } as AccomplishmentErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new accomplishment
export async function POST(
  request: NextRequest
): Promise<NextResponse<AccomplishmentResponse | AccomplishmentErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as AccomplishmentErrorResponse,
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
        } as AccomplishmentErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: AccomplishmentData = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Accomplishment title is required'
        } as AccomplishmentErrorResponse,
        { status: 400 }
      );
    }

    // Validate work_experience_id if provided
    if (body.work_experience_id) {
      const workExperience = await prisma.workExperience.findFirst({
        where: { 
          id: body.work_experience_id,
          candidate_id: userId 
        }
      });

      if (!workExperience) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Work experience not found or does not belong to candidate'
          } as AccomplishmentErrorResponse,
          { status: 400 }
        );
      }
    }

    // Validate resume_id if provided
    if (body.resume_id) {
      const resume = await prisma.resume.findFirst({
        where: { 
          id: body.resume_id,
          candidate_id: userId 
        }
      });

      if (!resume) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Resume not found or does not belong to candidate'
          } as AccomplishmentErrorResponse,
          { status: 400 }
        );
      }
    }

    const accomplishment = await prisma.accomplishment.create({
      data: {
        candidate_id: userId,
        title: body.title,
        description: body.description,
        work_experience_id: body.work_experience_id,
        resume_id: body.resume_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Accomplishment created successfully',
      data: [accomplishment]
    });

  } catch (error) {
    console.error('Error creating accomplishment:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create accomplishment'
      } as AccomplishmentErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface AwardData {
  id?: string;
  title?: string;
  associated_with?: string;
  offered_by?: string;
  date?: string;
  description?: string;
  media_url?: string;
  skill_ids?: string[];
}

interface AwardResponse {
  success: boolean;
  message: string;
  data?: Array<{
    id: string;
    candidate_id: string;
    title: string | null;
    associated_with: string | null;
    offered_by: string | null;
    date: Date | null;
    description: string | null;
    media_url: string | null;
    skill_ids: string[];
    created_at: Date | null;
    updated_at: Date | null;
  }>;
}

interface AwardErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch all awards for the authenticated candidate
export async function GET(
  request: NextRequest
): Promise<NextResponse<AwardResponse | AwardErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as AwardErrorResponse,
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
        } as AwardErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    const awards = await prisma.award.findMany({
      where: { candidate_id: userId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Awards retrieved successfully',
      data: awards
    });

  } catch (error) {
    console.error('Error fetching awards:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch awards'
      } as AwardErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new award
export async function POST(
  request: NextRequest
): Promise<NextResponse<AwardResponse | AwardErrorResponse>> {
  try {
    const token = getTokenFromHeaders(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required'
        } as AwardErrorResponse,
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
        } as AwardErrorResponse,
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    const body: AwardData = await request.json();

    // Validate required fields
    if (!body.title || !body.offered_by) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Award title and offered by are required'
        } as AwardErrorResponse,
        { status: 400 }
      );
    }

    // Validate date if provided
    let awardDate: Date | null = null;
    if (body.date) {
      awardDate = new Date(body.date);
      if (isNaN(awardDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Invalid date format'
          } as AwardErrorResponse,
          { status: 400 }
        );
      }
    }

    const award = await prisma.award.create({
      data: {
        candidate_id: userId,
        title: body.title,
        associated_with: body.associated_with,
        offered_by: body.offered_by,
        date: awardDate,
        description: body.description,
        media_url: body.media_url,
        skill_ids: body.skill_ids || []
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Award created successfully',
      data: [award]
    });

  } catch (error) {
    console.error('Error creating award:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create award'
      } as AwardErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

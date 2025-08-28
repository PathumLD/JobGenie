import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface AwardUpdateData {
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
  data?: {
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
  };
}

interface AwardErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific award
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AwardResponse | AwardErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    const award = await prisma.award.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!award) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Award not found'
        } as AwardErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Award retrieved successfully',
      data: award
    });

  } catch (error) {
    console.error('Error fetching award:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch award'
      } as AwardErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update award
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AwardResponse | AwardErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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
    const body: AwardUpdateData = await request.json();

    // Check if award exists and belongs to user
    const existingAward = await prisma.award.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingAward) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Award not found'
        } as AwardErrorResponse,
        { status: 404 }
      );
    }

    // Validate date if provided
    let awardDate: Date | null | undefined;
    if (body.date !== undefined) {
      if (body.date === null) {
        awardDate = null;
      } else {
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
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.associated_with !== undefined) updateData.associated_with = body.associated_with;
    if (body.offered_by !== undefined) updateData.offered_by = body.offered_by;
    if (awardDate !== undefined) updateData.date = awardDate;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.media_url !== undefined) updateData.media_url = body.media_url;
    if (body.skill_ids !== undefined) updateData.skill_ids = body.skill_ids;

    const updatedAward = await prisma.award.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Award updated successfully',
      data: updatedAward
    });

  } catch (error) {
    console.error('Error updating award:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update award'
      } as AwardErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete award
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | AwardErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    // Check if award exists and belongs to user
    const existingAward = await prisma.award.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingAward) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Award not found'
        } as AwardErrorResponse,
        { status: 404 }
      );
    }

    await prisma.award.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Award deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting award:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete award'
      } as AwardErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

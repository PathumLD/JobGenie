import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EmploymentType } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface WorkExperienceUpdateData {
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
  data?: {
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
  };
}

interface WorkExperienceErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific work experience
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<WorkExperienceResponse | WorkExperienceErrorResponse>> {
  try {
    const { id } = await params;
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

    const workExperience = await prisma.workExperience.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!workExperience) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Work experience not found'
        } as WorkExperienceErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Work experience retrieved successfully',
      data: workExperience
    });

  } catch (error) {
    console.error('Error fetching work experience:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch work experience'
      } as WorkExperienceErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update work experience
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<WorkExperienceResponse | WorkExperienceErrorResponse>> {
  try {
    const { id } = await params;
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
    const body: WorkExperienceUpdateData = await request.json();

    // Check if work experience exists and belongs to user
    const existingExperience = await prisma.workExperience.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingExperience) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Work experience not found'
        } as WorkExperienceErrorResponse,
        { status: 404 }
      );
    }

    // Validate dates if provided
    let startDate: Date | undefined;
    if (body.start_date) {
      startDate = new Date(body.start_date);
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
    }

    let endDate: Date | null | undefined;
    if (body.end_date !== undefined) {
      if (body.end_date === null) {
        endDate = null;
      } else {
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
    }

    // If setting as current, unset other current experiences
    if (body.is_current) {
      await prisma.workExperience.updateMany({
        where: { 
          candidate_id: userId,
          is_current: true,
          id: { not: id }
        },
        data: { is_current: false }
      });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.employment_type !== undefined) updateData.employment_type = body.employment_type;
    if (body.is_current !== undefined) updateData.is_current = body.is_current;
    if (body.company !== undefined) updateData.company = body.company;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.skill_ids !== undefined) updateData.skill_ids = body.skill_ids;
    if (body.media_url !== undefined) updateData.media_url = body.media_url;

    const updatedExperience = await prisma.workExperience.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Work experience updated successfully',
      data: updatedExperience
    });

  } catch (error) {
    console.error('Error updating work experience:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update work experience'
      } as WorkExperienceErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete work experience
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | WorkExperienceErrorResponse>> {
  try {
    const { id } = await params;
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

    // Check if work experience exists and belongs to user
    const existingExperience = await prisma.workExperience.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingExperience) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Work experience not found'
        } as WorkExperienceErrorResponse,
        { status: 404 }
      );
    }

    await prisma.workExperience.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Work experience deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting work experience:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete work experience'
      } as WorkExperienceErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

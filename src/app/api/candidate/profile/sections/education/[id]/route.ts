import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromCookies, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Types based on Prisma schema
interface EducationUpdateData {
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
  data?: {
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
  };
}

interface EducationErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific education record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<EducationResponse | EducationErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    const education = await prisma.education.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!education) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Education record not found'
        } as EducationErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Education record retrieved successfully',
      data: education
    });

  } catch (error) {
    console.error('Error fetching education record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch education record'
      } as EducationErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update education record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<EducationResponse | EducationErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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
    const body: EducationUpdateData = await request.json();

    // Check if education record exists and belongs to user
    const existingEducation = await prisma.education.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingEducation) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Education record not found'
        } as EducationErrorResponse,
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
          } as EducationErrorResponse,
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
            } as EducationErrorResponse,
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.degree_diploma !== undefined) updateData.degree_diploma = body.degree_diploma;
    if (body.university_school !== undefined) updateData.university_school = body.university_school;
    if (body.field_of_study !== undefined) updateData.field_of_study = body.field_of_study;
    if (body.description !== undefined) updateData.description = body.description;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (body.grade !== undefined) updateData.grade = body.grade;
    if (body.activities_societies !== undefined) updateData.activities_societies = body.activities_societies;
    if (body.skill_ids !== undefined) updateData.skill_ids = body.skill_ids;
    if (body.media_url !== undefined) updateData.media_url = body.media_url;

    const updatedEducation = await prisma.education.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Education record updated successfully',
      data: updatedEducation
    });

  } catch (error) {
    console.error('Error updating education record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update education record'
      } as EducationErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete education record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | EducationErrorResponse>> {
  try {
    const { id } = await params;
    const token = getTokenFromCookies(request);
    
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

    // Check if education record exists and belongs to user
    const existingEducation = await prisma.education.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingEducation) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Education record not found'
        } as EducationErrorResponse,
        { status: 404 }
      );
    }

    await prisma.education.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Education record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting education record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete education record'
      } as EducationErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

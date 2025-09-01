import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

// Force Node.js runtime for this API route
export const runtime = 'nodejs';

// Types based on Prisma schema
interface AccomplishmentUpdateData {
  title?: string;
  description?: string;
  work_experience_id?: string;
  resume_id?: string;
}

interface AccomplishmentResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    candidate_id: string;
    title: string | null;
    description: string | null;
    work_experience_id: string | null;
    resume_id: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
}

interface AccomplishmentErrorResponse {
  success: false;
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
  message: string;
}

// GET - Fetch specific accomplishment record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AccomplishmentResponse | AccomplishmentErrorResponse>> {
  try {
    const { id } = await params;
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

    const accomplishment = await prisma.accomplishment.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!accomplishment) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Accomplishment record not found'
        } as AccomplishmentErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Accomplishment record retrieved successfully',
      data: accomplishment
    });

  } catch (error) {
    console.error('Error fetching accomplishment record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch accomplishment record'
      } as AccomplishmentErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update accomplishment record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AccomplishmentResponse | AccomplishmentErrorResponse>> {
  try {
    const { id } = await params;
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
    const body: AccomplishmentUpdateData = await request.json();

    // Check if accomplishment record exists and belongs to user
    const existingAccomplishment = await prisma.accomplishment.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingAccomplishment) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Accomplishment record not found'
        } as AccomplishmentErrorResponse,
        { status: 404 }
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
            message: 'Invalid work experience ID'
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
            message: 'Invalid resume ID'
          } as AccomplishmentErrorResponse,
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.work_experience_id !== undefined) updateData.work_experience_id = body.work_experience_id;
    if (body.resume_id !== undefined) updateData.resume_id = body.resume_id;

    const updatedAccomplishment = await prisma.accomplishment.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Accomplishment record updated successfully',
      data: updatedAccomplishment
    });

  } catch (error) {
    console.error('Error updating accomplishment record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update accomplishment record'
      } as AccomplishmentErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete accomplishment record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string } | AccomplishmentErrorResponse>> {
  try {
    const { id } = await params;
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

    // Check if accomplishment record exists and belongs to user
    const existingAccomplishment = await prisma.accomplishment.findFirst({
      where: { 
        id,
        candidate_id: userId 
      }
    });

    if (!existingAccomplishment) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'Accomplishment record not found'
        } as AccomplishmentErrorResponse,
        { status: 404 }
      );
    }

    await prisma.accomplishment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Accomplishment record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting accomplishment record:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete accomplishment record'
      } as AccomplishmentErrorResponse,
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
